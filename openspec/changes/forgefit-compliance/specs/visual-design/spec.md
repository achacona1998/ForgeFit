# Delta for Visual Design & Branding

## ADDED Requirements

### Requirement: App Logo Integration

The system MUST display the ForgeFit logo (`assets/logo.svg`) prominently within the app.

#### Scenario: Logo in loading screen

- GIVEN the app is initializing
- WHEN the loading screen renders
- THEN the ForgeFit logo MUST be displayed centered above the loading indicator
- AND the logo MUST be sized at 120x120px on native, scaled proportionally

#### Scenario: Logo in header

- GIVEN the user is on any screen with a header
- THEN the ForgeFit logo MUST appear as a small watermark or icon in the header
- AND it MUST be 32x32px with appropriate tint color

#### Scenario: Logo on onboarding

- GIVEN the user is on the onboarding screen
- THEN the logo MUST be displayed large (80x80px) at the top of the screen
- AND it MUST use the brand green color

### Requirement: Brand Attribution

The system MUST display "Creado por achadev" in appropriate locations.

#### Scenario: Attribution in settings/about

- GIVEN the user navigates to the settings or about section
- THEN "Creado por achadev" MUST be displayed with the app version
- AND it MUST use muted text color

#### Scenario: Attribution in footer

- GIVEN the app shows a footer or bottom sheet
- THEN "Creado por achadev" MAY appear as a subtle text element
- AND it MUST not obstruct any interactive elements

#### Scenario: Attribution in splash/loading

- GIVEN the splash screen is dismissed
- THEN the attribution MAY appear briefly below the logo before navigation

### Requirement: Gradient Backgrounds

The system MUST use gradient backgrounds instead of flat colors for key screens.

#### Scenario: Dashboard gradient

- GIVEN the user opens the dashboard
- THEN the background MUST be a gradient from brand blue (#133875) to brand green (#37BB54)
- AND the gradient MUST transition smoothly

#### Scenario: Card elevation with shadows

- GIVEN a card is rendered
- THEN the card MUST have a subtle shadow/glow effect
- AND the shadow MUST be darker on dark mode, lighter on light mode

### Requirement: Polished Button Design

All buttons MUST have a modern, polished visual treatment.

#### Scenario: Primary button with gradient

- GIVEN a PrimaryButton renders in "lime" variant
- THEN the button MUST have a gradient background from lime green (#37BB54) to a darker shade (#2DA844)
- AND the button MUST have rounded corners (16px minimum)
- AND the button MUST have a subtle shadow

#### Scenario: Button with scale animation on press

- GIVEN the user presses a button
- WHEN the press interaction occurs
- THEN the button MUST scale to 0.97 and return to 1.0 on release
- AND the transition MUST be 100ms ease-out

#### Scenario: Ghost button with border glow

- GIVEN a ghost button renders
- THEN the button MUST have a 1px border with brand lime color at 40% opacity
- AND on press, the border MUST glow with the full brand color

### Requirement: Refined Card Design

All cards MUST have a modern card aesthetic with depth.

#### Scenario: Card with glass effect

- GIVEN a card renders in dark mode
- THEN the card MUST have a semi-transparent background with backdrop blur
- AND the card MUST have a subtle border with gradient opacity

#### Scenario: Card with subtle shadow

- GIVEN a card renders
- THEN the card MUST have a drop shadow: 0px 4px 12px rgba(0,0,0,0.15) dark / 0px 2px 8px rgba(0,0,0,0.06) light
- AND the card MUST have rounded corners of 20px

### Requirement: Typography Hierarchy

The system MUST establish a clear typographic hierarchy with consistent spacing.

#### Scenario: Heading hierarchy

- GIVEN a screen title is rendered
- THEN it MUST use fontWeight "900", fontSize 24-28px, letterSpacing -0.8
- AND it MUST use the foreground color

#### Scenario: Subtitle hierarchy

- GIVEN a subtitle is rendered
- THEN it MUST use fontWeight "600", fontSize 14px, letterSpacing 0.3
- AND it MUST use muted color

#### Scenario: Body text hierarchy

- GIVEN body text is rendered
- THEN it MUST use fontWeight "400", fontSize 15px, lineHeight 22px
- AND it MUST use text color

### Requirement: Custom Loading Screen

The loading screen MUST have a branded, polished design.

#### Scenario: Branded loading

- GIVEN the app is loading
- WHEN the loading screen renders
- THEN it MUST show the ForgeFit logo centered
- AND a pulsing animation on the logo
- AND the text "ForgeFit" below the logo with brand green color
- AND "Creado por achadev" in small text below
- AND a subtle gradient background matching brand colors

### Requirement: Consistent Spacing System

The system MUST use a consistent spacing scale across all screens.

#### Scenario: Spacing scale

- GIVEN any screen is designed
- THEN spacing MUST follow the scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80
- AND padding between sections MUST be at least 16px
- AND horizontal padding MUST be at least 18px

### Requirement: Tab Bar Branding

The tab bar MUST have branded visual treatment.

#### Scenario: Active tab indicator

- GIVEN a tab is active
- THEN the tab icon MUST be in brand green (#37BB54)
- AND a small green indicator bar MUST appear below the active tab
- AND the tab label MUST be in brand green

#### Scenario: Tab bar background

- GIVEN the tab bar renders
- THEN it MUST have a gradient background from surface to surfaceAlt
- AND it MUST have a top border with gradient opacity

### Requirement: Input Field Design

All input fields MUST have a modern, clean design.

#### Scenario: Focused input

- GIVEN an input field is focused
- THEN the border MUST change to brand lime color
- AND a subtle glow effect MUST appear around the input
- AND the label MUST move slightly above the input

#### Scenario: Input with icon

- GIVEN an input has an icon
- THEN the icon MUST be on the left side with appropriate padding
- AND the input border MUST have rounded corners of 14px

### Requirement: Empty State Enhancement

All empty states MUST have branded illustration-style icons.

#### Scenario: Branded empty state

- GIVEN an empty state renders
- THEN the icon MUST be inside a circular container with brand limeSoft background
- AND the icon MUST be brand green (#37BB54)
- AND the title MUST use fontWeight "900" and fontSize 18px
- AND a subtle decorative element MAY appear (dot pattern, faint gradient)

## MODIFIED Requirements

### Requirement: Palette Colors

The palette MUST incorporate the ForgeFit brand gradient colors and additional design tokens.

(Previously: Simple hex color palette with lime, blue, and standard semantic colors)

#### Scenario: Gradient color tokens

- GIVEN the theme is defined
- THEN gradient MUST be defined as: `linear-gradient(135deg, #133875, #37BB54)`
- AND brand colors MUST be: `#133875` (blue), `#37BB54` (green/lime)
- AND additional tokens MUST include: `glass`, `shadow`, `gradient`

#### Scenario: Dark mode refined

- GIVEN dark mode is active
- THEN background MUST be `#0A0F14` (currently correct)
- AND surface MUST be `#121A22` (currently correct)
- AND the brand colors MUST be more vibrant to maintain contrast on dark backgrounds

### Requirement: PrimaryButton Variant System

The PrimaryButton MUST support additional variants for better visual hierarchy.

(Previously: 4 variants — lime, ghost, blue, danger)

#### Scenario: Gradient variant

- GIVEN a PrimaryButton with variant "gradient"
- THEN the button MUST use a blue-to-green gradient background
- AND text MUST be white

#### Scenario: Outline variant

- GIVEN a PrimaryButton with variant "outline"
- THEN the button MUST have a transparent background with brand border
- AND text MUST be brand green

## REMOVED Requirements

### Requirement: Flat card backgrounds

Cards MUST NOT have flat backgrounds without shadow or depth effect.

(Reason: Modern design requires visual depth for usability and aesthetics)

### Requirement: System-only color scheme detection

The theme MUST support manual override in addition to system detection.

(Reason: Users should be able to force light or dark mode regardless of system preference)
