---
applyTo: "**"
---


# Project Context: Real World Wage Calculator

## Tech Stack
- **Framework:** React 18+ (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui (Components located in `@/components/ui`)
- **Icons:** Lucide-React

## Coding Rules for the AI
1. **Shadcn First:** ALWAYS use the existing components in `@/components/ui` before creating new HTML elements. If a component (like a Slider or Switch) is missing, tell the user to install it using `npx shadcn@latest add [component]`.
2. **Tailwind Only:** Do NOT create `.css` files or use `style={{}}` objects. Use Tailwind utility classes for everything.
3. **Strict TypeScript:** No `any` types. Always define interfaces for props in a separate type definition if complex.
4. **Clean Architecture:**
   - Business logic (math) goes into `src/features/calculator/logic.ts`.
   - Types go into `src/types/index.ts`.
   - Components go into `src/components`.
5. **Mobile Responsive:** Always ensure layouts stack vertically on mobile (`flex-col`) and expand on desktop (`md:flex-row`).

## Behavioral Instructions
- When the user asks for a "Form," assume we need a Card component wrapping Input fields.
- If the user asks to "Make it look good," use a clean, modern, greyscale/slate color palette with subtle borders.