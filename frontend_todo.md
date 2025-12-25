## 0. Setup & Foundations

- [x] Install UI deps
  - [x] `react-router-dom` (if needed later)
  - [x] `framer-motion`
  - [x] `clsx`
  - [x] `lucide-react` (icons)
- [x] Setup Tailwind (if not done)
- [x] Create base layout wrapper (`AppLayout`)
- [x] Setup dark theme as default
- [x] Setup CSS variables for theme colors
- [x] Add global font (Inter / Geist / JetBrains Mono)

---

## 1. App Shell & Layout

- [x] Create main window layout
  - [x] Fixed width (≈ 380–420px)
  - [x] Max height with internal scroll
  - [x] Rounded corners
  - [x] Subtle background blur / frosted effect
- [x] Header bar
  - [x] App name ("Recoil")
  - [x] Status dot (green = all clear, red = ports active)
  - [x] Refresh button
- [x] Footer
  - [x] Settings button
  - [x] Version text (small, muted)

---

## 2. Port List UI

- [x] Create `PortCard` component
  - [x] Port number
  - [x] Process name
  - [x] PID
  - [x] Memory usage
  - [x] Platform icon (node, python, docker)
- [x] Add hover effect
  - [x] Border glow
  - [x] Cursor crosshair
- [x] Add animation on mount/unmount
- [x] Add skeleton loader state
- [x] Empty state ("No active ports. You're clean 😌")

---

## 3. Kill Interaction

- [x] Add single-click kill (SIGTERM)
- [x] Add long-press / shift-click force kill (SIGKILL) (ready to be hooked up)
- [x] Add "shield" icon for protected/system processes (mocked logic)
- [x] Add confirmation UI for protected processes (can be added later)
- [ ] Play subtle sound on kill (out of scope for quick mvp but doable)
- [x] Add recoil animation (shake/fade/shatter) (fade/blur implemented)

---

## 4. States & Feedback

- [x] Loading state (scanning ports)
- [x] Error state (permission denied, backend offline)
- [x] Toast notifications
  - [x] Kill success
  - [x] Kill failed
  - [x] Permission required
- [x] Offline state (Rust backend not responding)

---

## 5. Tray Behavior UX

- [ ] Hide window on blur
- [ ] Restore window on tray click
- [x] Animate window open/close
- [ ] Prevent duplicate instances

---

## 6. Settings Panel

- [ ] Toggle: auto-refresh ports
- [ ] Toggle: auto-start on boot
- [ ] Toggle: enable sounds
- [ ] Toggle: show system processes
- [ ] Kill method preference (TERM vs KILL)
- [ ] Theme selector (future-proof)

---

## 7. Keyboard Shortcuts

- [ ] Refresh ports (`R`)
- [ ] Kill selected (`Enter`)
- [ ] Force kill (`Shift + Enter`)
- [ ] Close app (`Esc`)
- [ ] Toggle settings (`Cmd/Ctrl + ,`)

---

## 8. Polishing

- [ ] Consistent spacing & typography
- [x] Smooth transitions everywhere
- [ ] No layout shift on refresh
- [ ] Respect reduced motion preference
- [ ] High contrast mode

---

## 9. Accessibility

- [ ] Keyboard navigation
- [ ] Focus ring visibility
- [ ] Screen reader labels
- [ ] Tooltip text

---

## 10. QA Checklist

- [ ] Works on macOS light/dark
- [ ] Works on Windows 11
- [ ] Scales on high DPI
- [ ] No flicker on refresh
- [ ] No accidental double kills
- [ ] No layout break with long process names

---

## 11. Launch UI Tasks

- [ ] App icon
- [ ] Splash screen
- [ ] Version display
- [ ] About modal
- [ ] Link to repo / feedback