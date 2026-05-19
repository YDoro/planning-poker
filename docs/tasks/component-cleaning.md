# Task Guide: React Component Cleaning and Codebase Cleanup

Welcome! This document outlines a set of codebase cleanup, component refactoring, and UI enhancement tasks in the **Planning Poker** project. These tasks are aimed at improving code maintainability, enhancing typing safety, removing dead code, and modularizing the architecture.

Since you will be executing these tasks, this document provides the **motivation** (the "why") and the **action steps** (the "how") for each item.

---

## Table of Contents
1. [Prerequisites & Verification](#prerequisites--verification)
2. [Task 1: Remove Unused Components (Dead Code Elimination)](#task-1-remove-unused-components-dead-code-elimination)
3. [Task 2: Improve Component Props & Interfaces (TypeScript)](#task-2-improve-component-props--interfaces-typescript)
4. [Task 3: Improve Component Styling & Design System Alignment](#task-3-improve-component-styling--design-system-alignment)
5. [Task 4: Break Large Components into Smaller, Modular Pieces](#task-4-break-large-components-into-smaller-modular-pieces)
6. [Task 5: Move Components to Appropriate Context Folders (Relocation)](#task-5-move-components-to-appropriate-context-folders-relocation)

---

## Prerequisites & Verification

Before starting, ensure you can run the application and execute tests:
- **Run the project locally**: `yarn dev` (or `npm run dev`)
- **Run the test suite**: `yarn test` (or `npm test`)
- Keep a terminal open to run unit tests as you modify components to ensure no regressions are introduced.

---

## Task 1: Remove Unused Components (Dead Code Elimination)

### 1.1 Completely Unused Components & SVGs
* **Motivation:** Dead code clutters the codebase, increases bundle size, and confuses developers searching for active components.
* **Files to Delete:**
  * `src/components/GoogleAd/GoogleAd.tsx` (This component is commented out everywhere and never actually imported).
  * `src/components/elements/Button.tsx` (This is a redundant, broken component. The project uses standard buttons and `src/components/ui/button.tsx`).
  * `src/components/SVGs/CopyrightSVG.tsx`
  * `src/components/SVGs/DeleteSVG.tsx`
  * `src/components/SVGs/Example.tsx`
  * `src/components/SVGs/Exit.tsx`
  * `src/components/SVGs/Guide.tsx`
  * `src/components/SVGs/Refresh.tsx`
  * `src/components/SVGs/Trash.tsx` (We use `Trash2` from `lucide-react` instead).
  * `src/components/ui/switch.tsx` (Unused Shadcn/Radix component).
  * `src/components/ui/tabs.tsx` (Unused Shadcn/Radix component).
* **Action Steps:**
  1. Delete the files listed above.
  2. Search the codebase (specifically in `src/pages/HomePage/HomePage.tsx`, `src/pages/AboutPage/AboutPage.tsx`, `src/pages/GuidePage/GuidePage.tsx`, and `src/components/Players/CardPicker/CardPicker.tsx`) for commented-out JSX tags (like `{/* <GoogleAd /> */}`) and remove those lines.
  3. Ensure there are no lingering imports of these files in `src/components/Toolbar/components/index.ts` or other index exports.

### 1.2 Unused Exports inside Active Components
* **Target File:** `src/components/Poker/GameController/StoryCard.tsx`
* **Motivation:** The file exports `AddStoryCard` on line 159, but it is never imported or used anywhere in the codebase.
* **Action Steps:**
  1. Open `src/components/Poker/GameController/StoryCard.tsx`.
  2. Remove the `AddStoryCard` component definition and export.
  3. Run the unit tests for `StoryCard` to ensure it still compiles and runs.

---

## Task 2: Improve Component Props & Interfaces (TypeScript)

### 2.1 Refactor the `Loading` Component Props
* **Target File:** `src/components/Loading/Loading.tsx`
* **Motivation:** The `Loading` component defines its props inline as `{ size?: string }`. It does not support forwarding standard SVG props (like `className` for spacing/margins, `style`, or `aria-*` tags), which limits its flexibility.
* **Action Steps:**
  1. Define a separate interface for props extending React's standard SVG attributes:
     ```typescript
     interface LoadingProps extends React.SVGProps<SVGSVGElement> {
       size?: 'small' | 'default';
     }
     ```
  2. Update the component to destructure `size` and collect the remaining attributes using the rest operator:
     ```tsx
     export const Loading = ({ size, ...props }: LoadingProps) => {
       // ... sizing logic
       return (
         <svg {...props} width={width} height={height} ...>
       );
     };
     ```
  3. Update usage of `Loading` where necessary.

### 2.2 Rename Generic Type Names
* **Target File:** `src/components/elements/CircularProgressBar.tsx`
* **Motivation:** The props interface is named `Props` (line 3). This is too generic and can conflict when importing multiple types. It should follow the `<ComponentName>Props` pattern.
* **Action Steps:**
  1. Rename `Props` to `CircularProgressBarProps`.
  2. Update the component declaration: `const CircularProgressBar: FC<CircularProgressBarProps> = (props) => { ... }`.

### 2.3 Reduce Prop Drilling in `TaskList.tsx`
* **Target File:** `src/components/Poker/GameController/TaskList.tsx`
* **Motivation:** `DraggableTaskItem` accepts 12 distinct props. Many of these props are callback state setters (`setEditTitle`, `handleEditTask`, `handleCancelEdit`, `setEditingId`) passed down from `TaskList`. This is known as *prop drilling* and makes the component harder to test and reason about.
* **Action Steps:**
  1. Analyze if the task editing state (whether this item is in edit mode and the input text) can be managed **locally** within `DraggableTaskItem` instead of bubble-up state stored in `TaskList`.
  2. If the edit state is local, `DraggableTaskItem` only needs a callback to save the title (e.g. `onSaveTask(taskId, newTitle)`) and cancel editing, removing 4 props from its interface.

---

## Task 3: Improve Component Styling & Design System Alignment

### 3.1 Make `Divider` Configurable
* **Target File:** `src/components/Divider/Divider.tsx`
* **Motivation:** The `Divider` component has hardcoded styling: `w-full max-w-7xl my-8` and `border-gray-300`. It is impossible to customize its padding, margins, or color when used in different views.
* **Action Steps:**
  1. Update `Divider` to accept a `className` prop and combine it with a utility function (like `cn` from `src/lib/utils` or similar) to merge custom Tailwind styles:
     ```tsx
     import { cn } from '@/src/lib/utils'; // adjust import path as necessary

     export const Divider = ({ className }: { className?: string }) => {
       return (
         <div className={cn('w-full max-w-7xl my-8', className)}>
           <hr className='border-t border-border' /> {/* Use 'border-border' instead of gray-300 to support dark mode */}
         </div>
       );
     };
     ```

### 3.2 Refactor `LanguageControl` to Use Design System Dropdowns
* **Target File:** `src/components/Toolbar/components/LanguageControl.tsx`
* **Motivation:** It uses a raw HTML `<select>` with a narrow width (`w-10`). This clips the language text, looks generic/unprofessional, and native select elements do not support dark mode styling consistently across browsers.
* **Action Steps:**
  1. Refactor `LanguageControl` to use the `<Select>` component defined under `src/components/ui/select.tsx`.
  2. Style it to look premium, matching the theme controls, and ensure the selected language label doesn't clip.

### 3.3 Replace Custom Dropdown in `Toolbar` with Popover
* **Target File:** `src/components/Toolbar/Toolbar.tsx`
* **Motivation:** The custom dropdown menu on the toolbar is managed using local state (`isDropdownOpen`), an absolute div container with raw background classes (`bg-white dark:bg-gray-800`), and a manual `mousedown` event listener to handle closing the dropdown when clicking outside. This is prone to bugs and doesn't handle keyboard focus traps for accessibility.
* **Action Steps:**
  1. Remove the local state `isDropdownOpen` and the `handleClickOutside` event listener from the `useEffect`.
  2. Replace the custom dropdown div with the `<Popover>` component (already imported from `src/components/ui/popover.tsx` for the history menu). This handles clicks outside, keyboard navigation, and transitions automatically.

### 3.4 Clean Up `ControlDock.tsx`
* **Target File:** `src/components/Poker/GameController/ControlDock.tsx`
* **Motivation:** The main container element has an extremely long, unreadable styling string (line 95). Furthermore, it uses `window.location.href = '/'` on line 91 to navigate home when deleting a session, which forces a full page reload, discarding state and violating SPA routing principles.
* **Action Steps:**
  1. Break down the CSS classes into readable variables or clean them up.
  2. Import the `useNavigate` hook from `react-router-dom` and replace `window.location.href = '/'` with `navigate('/')`.

### 3.5 Fix Color and Spectator Layout Inconsistencies
* **Target File:** `src/components/Players/PlayerCard/PlayerCard.tsx`
* **Motivation:**
  * **Color Inconsistency**: Player cards only display their selected card's background color when `game.isFinished` is true. However, when the current task is revealed (`currentTask?.revealed` is true), the card value becomes visible, but the color remains blank.
  * **Spectator UX Bug**: Spectators/non-voters (who do not participate in voting) display a thumbs-up "👍" during the voting phase. However, as soon as the task is revealed, they revert to the thinking emoji "🤔" because their status never moves to `Finished`.
* **Action Steps:**
  1. Locate the `getCardColor` function:
     ```typescript
     const getCardColor = (game: Game, value: number | undefined): string => { ... }
     ```
     Modify it to accept the task revealed state (e.g. `isRevealed` or check the current task from store) so that the card background is styled appropriately once cards are revealed.
  2. Locate the `getCardValue` function and adjust its conditions to ensure that a player with `isNonVoter` true continues to render "👍" (or another spectator indicator) even when `isRevealed` is true, instead of showing "🤔".

---

## Task 4: Break Large Components into Smaller, Modular Pieces

### 4.1 Split out `DraggableTaskItem` from `TaskList`
* **Target File:** `src/components/Poker/GameController/TaskList.tsx`
* **Motivation:** This file contains two distinct React components in a single file: `DraggableTaskItem` and `TaskList`. `DraggableTaskItem` is around 160 lines long and handles complex React DnD (`useDrag` and `useDrop`) logic. Keeping them together violates the single-responsibility principle and makes the file harder to read.
* **Action Steps:**
  1. Create a new file under `src/components/Poker/GameController/components/DraggableTaskItem.tsx` (create the `components` subdirectory inside `GameController` if it doesn't exist).
  2. Move the `DraggableTaskItem` component declaration and its related imports (`useDrag`, `useDrop`, `ItemTypes`, etc.) to this new file.
  3. Export it and import it back in `src/components/Poker/GameController/TaskList.tsx`.

### 4.2 Extract Dialog Components from `ControlDock`
* **Target File:** `src/components/Poker/GameController/ControlDock.tsx`
* **Motivation:** The `ControlDock` component contains the main layout but is heavily cluttered by three inline `AlertDialog` markup trees (Skip Dialog, Finish Dialog, and Delete Session Dialog).
* **Action Steps:**
  1. Extract each dialog into its own minor component in the same folder or in a sub-components folder (e.g., `SkipTaskDialog`, `FinishSessionDialog`, `DeleteSessionDialog`).
  2. This will reduce `ControlDock`'s line count and isolate the dialog states, making the primary layout code much cleaner and easier to read.

---

## Task 5: Move Components to Appropriate Context Folders (Relocation)

### 5.1 Relocate the `RecentGames` Component
* **Current Path:** `src/components/Poker/RecentGames/`
* **Target Path:** `src/components/RecentGames/` (or `src/components/History/`)
* **Motivation:** The `RecentGames` component renders the user's session history. Even though it displays Planning Poker games, it is used globally inside the main navigation `Toolbar` (via the `HistoryButton` popover). Keeping it nested inside the `Poker` context folder violates modular layout guidelines since a global component (the Toolbar) is importing a contextual component (`Poker/RecentGames`).
* **Action Steps:**
  1. Move the `RecentGames` folder (containing `RecentGames.tsx` and `RecentGames.test.tsx`) from `src/components/Poker/RecentGames/` to `src/components/RecentGames/`.
  2. Update the import path in `src/components/Toolbar/components/History.tsx`:
     ```typescript
     import { RecentGames } from "../../RecentGames/RecentGames";
     ```
  3. Update any relative paths in `RecentGames.tsx` and `RecentGames.test.tsx` (like imports for hooks, services, or UI components).
  4. Run `yarn test` to make sure the tests pass in the new directory.
