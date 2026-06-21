# Staff Guide

## Login

Use `/staff/login` with staff phone and PIN. Admins can create users at `/admin/staff`.

Roles:

- `admin`: full access, staff/settings/deployment/checklist.
- `manager`: operations, orders, inventory, reports, customers, subscriptions, corporate.
- `driver`: driver board and delivery completion.

Emergency password access still exists through the legacy admin/driver password gates, but should only be used if staff login is unavailable.

## Core Screens

- `/admin/orders`: order queue.
- `/admin/orders/[id]`: order detail, payment, runner assignment, personalized workflow.
- `/admin/operations`: daily operations.
- `/admin/manifest`: printable delivery list.
- `/driver`: runner board.
- `/admin/inventory`: stock and low-stock alerts.
- `/admin/customers`: customer directory.
- `/admin/reports`: business tracking.
- `/admin/audit`: staff activity.
- `/admin/errors`: application errors.
