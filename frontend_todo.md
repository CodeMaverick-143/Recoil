## 0. Setup & Foundations

- [ ] Install UI deps
  - [ ] `react-router-dom` (if needed later)
  - [ ] `framer-motion`
  - [ ] `clsx`
  - [ ] `lucide-react` (icons)
- [ ] Setup Tailwind (if not done)
- [ ] Create base layout wrapper (`AppLayout`)
- [ ] Setup dark theme as default
- [ ] Setup CSS variables for theme colors
- [ ] Add global font (Inter / Geist / JetBrains Mono)

---

## 1. App Shell & Layout

- [ ] Create main window layout
  - [ ] Fixed width (≈ 380–420px)
  - [ ] Max height with internal scroll
  - [ ] Rounded corners
  - [ ] Subtle background blur / frosted effect
- [ ] Header bar
  - [ ] App name ("Recoil")
  - [ ] Status dot (green = all clear, red = ports active)
  - [ ] Refresh button
- [ ] Footer
  - [ ] Settings button
  - [ ] Version text (small, muted)

---

## 2. Port List UI

- [ ] Create `PortCard` component
  - [ ] Port number
  - [ ] Process name
  - [ ] PID
  - [ ] Memory usage
  - [ ] Platform icon (node, python, docker)
- [ ] Add hover effect
  - [ ] Border glow
  - [ ] Cursor crosshair
- [ ] Add animation on mount/unmount
- [ ] Add skeleton loader state
- [ ] Empty state ("No active ports. You're clean 😌")

---

## 3. Kill Interaction

- [ ] Add single-click kill (SIGTERM)
- [ ] Add long-press / shift-click force kill (SIGKILL)
- [ ] Add "shield" icon for protected/system processes
- [ ] Add confirmation UI for protected processes
- [ ] Play subtle sound on kill
- [ ] Add recoil animation (shake/fade/shatter)

---

## 4. States & Feedback

- [ ] Loading state (scanning ports)
- [ ] Error state (permission denied, backend offline)
- [ ] Toast notifications
  - [ ] Kill success
  - [ ] Kill failed
  - [ ] Permission required
- [ ] Offline state (Rust backend not responding)

---

## 5. Tray Behavior UX

- [ ] Hide window on blur
- [ ] Restore window on tray click
- [ ] Animate window open/close
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
- [ ] Smooth transitions everywhere
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

---