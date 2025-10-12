# Roadside Attraction Visualization App - Design Guidelines

## Design Approach
**System**: Material Design principles with map-focused customization, drawing inspiration from Google Maps and Airbnb's location-based interfaces for the interactive mapping experience.

**Rationale**: This data visualization tool prioritizes clarity, efficient filtering, and seamless map interaction. Material Design provides robust patterns for information hierarchy and interactive states essential for map pins, filters, and photo displays.

## Core Design Elements

### A. Color Palette

**Dark Mode** (Primary):
- Background: 15 8% 12% (deep charcoal)
- Surface: 15 8% 18% (elevated card background)
- Primary: 210 100% 55% (vibrant blue for pins/active states)
- Accent: 280 70% 60% (purple for selected categories)
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 70%
- Border: 0 0% 30%

**Light Mode**:
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 210 100% 50%
- Accent: 280 60% 55%
- Text Primary: 0 0% 10%
- Text Secondary: 0 0% 45%

**Pin Colors** (Map Markers):
- Muffler Men: 25 95% 55% (vibrant orange)
- World's Largest: 145 65% 45% (teal green)
- Default/All: Primary blue
- Selected: Accent purple with glow

### B. Typography
- **Primary Font**: Inter (Google Fonts) - clean, readable for UI elements
- **Headings**: Font weight 700, sizes: text-2xl (map title), text-lg (categories), text-base (photo captions)
- **Body**: Font weight 400-500, text-sm to text-base
- **Labels**: Font weight 600, text-xs to text-sm, uppercase tracking-wide for category tags

### C. Layout System
**3-Column Responsive Grid**:
- Left Sidebar: Fixed width 280px on desktop, collapsible drawer on mobile
- Main Content (Map): Flex-grow, minimum 60% viewport width
- Right Panel: 320px for photo display, slides in on pin selection

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 to p-6
- Section spacing: space-y-4 to space-y-6
- Map container: Minimal padding (p-2) for maximum map real estate

### D. Component Library

**Map Container**:
- Full-height main content area with subtle shadow
- Interactive SVG US map with state boundaries in muted gray
- Animated pin markers with bounce-in entrance
- Hover states: Pin scales to 1.15x with subtle shadow
- Selected pin: Pulsing animation, accent color

**Category Sidebar**:
- Sticky positioning (top-20)
- Category buttons: Full-width, rounded-lg, with icon + label
- Active state: Solid accent background with white text
- Inactive: Transparent with border, hover shows light accent fill
- Badge counts showing number of locations per category

**Pin Interaction**:
- Default size: 24px diameter circular markers
- On hover: Tooltip showing location name
- On click: Pin enlarges, map pans/zooms to center, right panel slides in

**Photo Display Panel**:
- Slides from right on pin selection
- Large image display (max-h-96) with object-cover
- Photo metadata below: location name, date, category tags
- Close button (top-right) with backdrop blur
- Smooth slide-in/out transitions (300ms ease-in-out)

**Filter States**:
- Clear visual feedback when filters applied
- Active filter count badge in header
- "Clear all filters" button appears when filters active
- Map updates with fade transition (200ms)

**Navigation Header**:
- Sticky top header (h-16) with logo, app title, and user profile
- Facebook connection status indicator
- Theme toggle (dark/light mode)

### E. Interactive States & Animations

**Map Pins**:
- Entry: Stagger animation, drop from top with bounce
- Hover: Scale 1.15x, show location tooltip (200ms)
- Click: Enlarge to 1.3x, change to accent color, others dim to 40% opacity
- Filter change: Fade out removed pins (300ms), fade in new pins with stagger

**Sidebar Categories**:
- Hover: Background shifts to accent/10 opacity
- Active: Bold accent background, icon color change
- Transition: All 150ms ease-in-out

**Photo Panel**:
- Slide animation: translateX from 100% to 0
- Backdrop: Semi-transparent overlay (bg-black/40) with blur
- Image load: Skeleton placeholder, fade-in when loaded

**No Animations**: Page transitions, constant micro-animations, distracting scroll effects

## Images
**No Hero Image**: This is a utility app focused on the map interface

**Photo Sources**:
- Facebook Graph API tagged photos (primary content)
- Category icons: Use Heroicons for Muffler Men, World's Largest, Location markers
- Placeholder images during API loading: Simple gradient patterns matching pin colors

**Loading States**:
- Map: Skeleton US outline with pulsing pin placeholders
- Photos: Shimmer effect placeholder (bg-gradient-to-r with animation)
- Sidebar: Loading bars for category counts

## Accessibility & Responsiveness

**Mobile Adaptations** (<768px):
- Stack to single column
- Sidebar becomes bottom drawer (swipe up)
- Map takes full viewport height
- Photo panel overlays as modal
- Touch-optimized pin sizes (minimum 44px tap target)

**Desktop** (≥768px):
- Full 3-column layout
- Larger map interaction area
- Side-by-side category filtering and photo display

**Keyboard Navigation**:
- Tab through categories and pins
- Enter to select category/pin
- Escape to close photo panel
- Arrow keys to navigate between pins

**Contrast**: WCAG AA compliant, all interactive elements have 3:1 contrast minimum, text 4.5:1

This design creates a clean, functional data visualization experience that prioritizes the map interaction while maintaining easy access to filtering and photo viewing capabilities.