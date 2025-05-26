## General Constraints

- **KISS (Keep It Simple, Stupid):** Prioritize simplicity and clarity in code and architecture.
- **DRY (Don't Repeat Yourself):** Reuse code where possible. Abstract repetitive logic.
- **YAGNI (You Aren’t Gonna Need It):** Don’t build functionality until it's needed.
- **No premature optimization:** Focus on clarity first, optimize only where necessary.
- **Don’t build or run the app until explicitly instructed.**
- **No unnecessary comments:** Code should be self-explanatory with clean naming conventions.
- **Consistent naming conventions** and project structure must be followed.
- **No magic values:** Use constants or environment variables where applicable.

## Server-Side Constraints

All server actions **must include**:

- **Authentication checks**
- **Input validation** using Zod
- **Proper error handling**
- **Strong TypeScript types**
- **Database transactions** where necessary

## Frontend Design Constraints

### Responsive Design Implementation

Ensure the Blurr HR Portal is **fully responsive**:

- Mobile-first design approach
- Responsive Kanban board
- Mobile navigation drawer
- Touch-friendly interactions
- Optimized layouts for tablets

#### Must Implement:

- Responsive grid layouts
- Mobile sidebar with proper animations
- Touch gestures for drag-and-drop
- Collapsible components
- Proper viewport handling

---

## Performance Optimization

Ensure application is optimized for production:

- Database query optimization
- Component memoization
- Lazy loading for heavy components
- Image optimization
- Bundle size optimization
