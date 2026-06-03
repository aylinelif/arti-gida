import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { ToastService } from '../../services/toast.service';
import { ConversationRead, MessageRead, UserMin } from '../../models/message';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.scss'
})
export class MessagesPage implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  conversations: ConversationRead[] = [];
  activeConversation: ConversationRead | null = null;
  messages: MessageRead[] = [];
  
  newMessageText = '';
  isLoadingConversations = true;
  isLoadingHistory = false;
  isTyping = false;
  
  // Contextual listing info when chat is initiated from listing details
  contextListingId?: number;
  contextListingTitle?: string;

  private pollSubscription?: Subscription;
  private autoScrollNeeded = false;

  constructor(
    public auth: AuthService,
    private messageService: MessageService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    if (!this.auth.isLoggedIn) {
      this.toast.warning('Mesajlarınızı görmek için lütfen giriş yapın.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/messages' } });
      return;
    }

    // Read query params for new chat initiation immediately
    this.route.queryParams.subscribe(params => {
      const otherId = params['otherUserId'] ? Number(params['otherUserId']) : null;
      this.contextListingId = params['listingId'] ? Number(params['listingId']) : undefined;
      this.contextListingTitle = params['listingTitle'] || undefined;

      this.loadConversations(() => {
        if (otherId) {
          // Check if this conversation already exists in our loaded list
          const existing = this.conversations.find(c => c.otherUser.id === otherId);
          if (existing) {
            this.selectConversation(existing);
          } else {
            // Initiate a temporary empty conversation with the other user
            this.initiateNewChat(otherId);
          }
        }
      });
    });

    // Poll conversations and active chat history every 6 seconds to fetch new messages
    this.pollSubscription = interval(6000).subscribe(() => {
      this.pollUpdates();
    });
  }

  ngOnDestroy(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    if (this.autoScrollNeeded) {
      this.scrollToBottom();
      this.autoScrollNeeded = false;
    }
  }

  loadConversations(callback?: () => void): void {
    this.messageService.getConversations().subscribe({
      next: (data) => {
        this.conversations = data;
        this.isLoadingConversations = false;
        if (callback) callback();
      },
      error: () => {
        this.isLoadingConversations = false;
        this.toast.error('Konuşmalar yüklenirken bir hata oluştu.');
      }
    });
  }

  initiateNewChat(otherUserId: number): void {
    this.isLoadingHistory = true;
    
    // In order to show user name/avatar in header, we can fetch name from business listings or mock it.
    // We will query listing details if we have context, or mock a name for the conversation.
    const tempName = this.contextListingTitle ? `İşletme Yetkilisi` : `Kullanıcı #${otherUserId}`;
    
    const tempConv: ConversationRead = {
      otherUser: {
        id: otherUserId,
        name: tempName,
        role: this.contextListingTitle ? 'business' : 'user',
        profilePictureUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=user${otherUserId}`
      },
      lastMessage: {
        id: 0,
        senderId: 0,
        receiverId: 0,
        content: 'Yeni konuşma başlatıldı.',
        timestamp: new Date().toISOString(),
        isRead: true
      },
      unreadCount: 0
    };

    // Insert temp conversation at the top
    this.conversations = [tempConv, ...this.conversations];
    this.selectConversation(tempConv);
  }

  selectConversation(conv: ConversationRead): void {
    this.activeConversation = conv;
    this.messages = [];
    this.isLoadingHistory = true;
    this.isTyping = false;

    // Reset unread count locally
    conv.unreadCount = 0;

    this.messageService.getHistory(conv.otherUser.id).subscribe({
      next: (history) => {
        this.messages = history;
        this.isLoadingHistory = false;
        this.autoScrollNeeded = true;
      },
      error: () => {
        this.isLoadingHistory = false;
        this.toast.error('Mesaj geçmişi yüklenemedi.');
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessageText.trim() || !this.activeConversation) return;

    const receiverId = this.activeConversation.otherUser.id;
    const content = this.newMessageText.trim();
    const listingId = this.contextListingId;

    this.newMessageText = '';
    
    // Instantly append sent message locally for fluid UI response
    const tempMsg: MessageRead = {
      id: -1,
      senderId: this.auth.currentUser()?.id || 0,
      receiverId: receiverId,
      content: content,
      timestamp: new Date().toISOString(),
      listingId: listingId,
      listingTitle: this.contextListingTitle,
      isRead: false
    };
    
    this.messages.push(tempMsg);
    this.autoScrollNeeded = true;

    this.messageService.sendMessage(receiverId, content, listingId).subscribe({
      next: (savedMsg) => {
        // Update temporary message with DB id and correct timestamp
        const index = this.messages.indexOf(tempMsg);
        if (index !== -1) {
          this.messages[index] = savedMsg;
        }
        
        // Refresh conversations list to update order and last messages
        this.loadConversations(() => {
          // Sync activeConversation to point to the newly loaded real conversation from the backend
          const realConv = this.conversations.find(c => c.otherUser.id === receiverId);
          if (realConv) {
            this.activeConversation = realConv;
          }
        });

        // Simulate typing and reply if interacting in mock mode (simulation)
        this.triggerSimulationReply(content);
      },
      error: () => {
        // Remove locally appended message on error
        this.messages = this.messages.filter(m => m !== tempMsg);
        this.toast.error('Mesaj gönderilemedi.');
      }
    });
  }

  pollUpdates(): void {
    // Refresh conversations list in background
    this.messageService.getConversations().subscribe({
      next: (data) => {
        const tempConv = this.conversations.find(c => c.lastMessage.id === 0);
        
        // Update unread badges and items without breaking active selection
        const updatedConversations = data.map(newC => {
          const old = this.conversations.find(o => o.otherUser.id === newC.otherUser.id);
          if (old && this.activeConversation?.otherUser.id === newC.otherUser.id) {
            // Keep active conversation unread count at 0
            newC.unreadCount = 0;
          }
          return newC;
        });

        // Keep the temporary empty conversation in the list if it's currently active and not yet saved
        if (tempConv && !updatedConversations.some(c => c.otherUser.id === tempConv.otherUser.id)) {
          this.conversations = [tempConv, ...updatedConversations];
        } else {
          this.conversations = updatedConversations;
        }

        // Sync activeConversation reference to point to the real conversation once it's saved
        if (this.activeConversation && this.activeConversation.lastMessage.id === 0) {
          const matchingReal = updatedConversations.find(c => c.otherUser.id === this.activeConversation!.otherUser.id);
          if (matchingReal) {
            this.activeConversation = matchingReal;
          }
        }
      }
    });

    // If a conversation is active, poll its history to fetch incoming messages
    if (this.activeConversation && !this.isTyping) {
      const activeId = this.activeConversation.otherUser.id;
      this.messageService.getHistory(activeId).subscribe({
        next: (history) => {
          if (history.length > this.messages.length) {
            this.messages = history;
            this.autoScrollNeeded = true;
          }
        }
      });
    }
  }

  private triggerSimulationReply(userMessage: string): void {
    if (!this.activeConversation) return;
    const activeUserId = this.activeConversation.otherUser.id;
    const isBusiness = this.activeConversation.otherUser.role === 'business';

    // 1. Show typing status after 1.2 seconds
    setTimeout(() => {
      if (this.activeConversation && this.activeConversation.otherUser.id === activeUserId) {
        this.isTyping = true;
        this.autoScrollNeeded = true;
      }
    }, 1200);

    // 2. Add realistic response after 3 seconds
    setTimeout(() => {
      if (!this.activeConversation || this.activeConversation.otherUser.id !== activeUserId) return;
      
      this.isTyping = false;
      
      let replyContent = "Merhabalar! Mesajınız bize ulaştı. En kısa sürede size yardımcı olacağız. 🌱";
      
      const lowerMsg = userMessage.toLowerCase();
      if (isBusiness) {
        if (lowerMsg.includes('teslim') || lowerMsg.includes('almak') || lowerMsg.includes('saat')) {
          replyContent = "Merhaba! Tabii ki, ilanda belirttiğimiz saat aralığında dükkandan teslim alabilirsiniz. Şimdiden afiyet olsun! 😊";
        } else if (lowerMsg.includes('taze') || lowerMsg.includes('sıcak') || lowerMsg.includes('günlük')) {
          replyContent = "Ürünlerimiz tamamen tazedir. Gün sonu israfı önlemek adına uygun fiyatla paylaşıyoruz. Gönül rahatlığıyla alabilirsiniz.";
        } else if (lowerMsg.includes('merhaba') || lowerMsg.includes('selam')) {
          replyContent = "Merhabalar, ArtıGıda ilanımız hakkında sorunuz varsa yardımcı olmaktan mutluluk duyarız! Kalan taze gıdaları kurtardığınız için teşekkürler.";
        }
      } else {
        if (lowerMsg.includes('rezerve') || lowerMsg.includes('geliyorum')) {
          replyContent = "Harika! Rezervasyonunuzu hazırlıyorum, dükkanda görüşmek üzere. Teşekkürler!";
        }
      }

      const mockReply: MessageRead = {
        id: -2,
        senderId: activeUserId,
        receiverId: this.auth.currentUser()?.id || 0,
        content: replyContent,
        timestamp: new Date().toISOString(),
        isRead: true
      };

      // Push reply to UI and trigger audio/scroll
      this.messages.push(mockReply);
      this.autoScrollNeeded = true;
      
      // Update last message in conversation list
      const conv = this.conversations.find(c => c.otherUser.id === activeUserId);
      if (conv) {
        conv.lastMessage = mockReply;
      }
    }, 3200);
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
