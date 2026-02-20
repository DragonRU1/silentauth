=== SilentAuth ===
Contributors: silentauth
Tags: captcha, verification, anti-spam, security
Requires at least: 5.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Invisible captcha alternative. Add human verification to any form with a single shortcode.

== Description ==

SilentAuth provides a simple verification button that replaces traditional CAPTCHAs. Add `[silentauth]` to any form and users verify with one click.

**Features:**
* One-click verification button
* No puzzles or image recognition
* Works with any WordPress form
* Server-side token validation
* Lightweight — no external dependencies

== Installation ==

1. Upload the `silentauth` folder to `/wp-content/plugins/`
2. Activate the plugin through the Plugins menu
3. Go to Settings → SilentAuth and enter your API URL and API Key
4. Add `[silentauth]` shortcode inside any form

== Usage ==

**Shortcode:**
`[silentauth]` or `[silentauth text="Click to verify"]`

**Server-side validation (in your form handler):**
`if (!silentauth_is_verified($_POST['silentauth_token'])) { wp_die('Verification failed'); }`

== Changelog ==

= 1.0.0 =
* Initial release
