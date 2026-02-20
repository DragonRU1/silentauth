<?php
/**
 * Plugin Name: SilentAuth
 * Plugin URI:  https://github.com/DragonRU1/silentauth
 * Description: Invisible captcha alternative. Add human verification to any form with [silentauth] shortcode.
 * Version:     1.0.0
 * Author:      SilentAuth
 * License:     GPL v2 or later
 * Text Domain: silentauth
 */

if (!defined('ABSPATH')) {
    exit;
}

define('SILENTAUTH_VERSION', '1.0.0');
define('SILENTAUTH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SILENTAUTH_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once SILENTAUTH_PLUGIN_DIR . 'includes/class-silentauth-api.php';
require_once SILENTAUTH_PLUGIN_DIR . 'includes/class-silentauth-admin.php';
require_once SILENTAUTH_PLUGIN_DIR . 'includes/class-silentauth-public.php';

// Admin settings
$silentauth_admin = new SilentAuth_Admin();
add_action('admin_menu', [$silentauth_admin, 'add_settings_page']);
add_action('admin_init', [$silentauth_admin, 'register_settings']);

// Public: shortcode + AJAX + assets
$silentauth_public = new SilentAuth_Public();
add_shortcode('silentauth', [$silentauth_public, 'render_shortcode']);
add_action('wp_enqueue_scripts', [$silentauth_public, 'enqueue_assets']);
add_action('wp_ajax_silentauth_create_session', [$silentauth_public, 'ajax_create_session']);
add_action('wp_ajax_nopriv_silentauth_create_session', [$silentauth_public, 'ajax_create_session']);

/**
 * Validate a SilentAuth token server-side.
 * Use in form handlers: silentauth_is_verified($_POST['silentauth_token'])
 */
function silentauth_is_verified(string $token): bool {
    $api = new SilentAuth_API();
    $session = $api->get_session($token);
    return is_array($session) && isset($session['status']) && $session['status'] === 'VERIFIED';
}
