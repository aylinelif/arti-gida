"""auth passwords, listing fields, reservations table

Revision ID: 002
Revises: 001
Create Date: 2026-05-16

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "password_hash",
            sa.String(length=255),
            nullable=False,
            server_default="",
        ),
    )
    op.alter_column("users", "password_hash", server_default=None)

    op.add_column("listings", sa.Column("description", sa.Text(), nullable=True))
    op.add_column(
        "listings",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.alter_column("listings", "is_active", server_default=None)

    op.create_table(
        "reservations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("listing_id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("reserved_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["listing_id"], ["listings.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_reservations_customer_id"), "reservations", ["customer_id"], unique=False
    )
    op.create_index(
        op.f("ix_reservations_listing_id"), "reservations", ["listing_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_reservations_listing_id"), table_name="reservations")
    op.drop_index(op.f("ix_reservations_customer_id"), table_name="reservations")
    op.drop_table("reservations")
    op.drop_column("listings", "is_active")
    op.drop_column("listings", "description")
    op.drop_column("users", "password_hash")
