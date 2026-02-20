<?php

if (!defined('ABSPATH')) {
    exit;
}

class SilentAuth_Public {

    public function enqueue_assets(): void {
        $post = get_post();
        $content = $post ? $post->post_content : '';
        if (!$content || !has_shortcode($content, 'silentauth')) {
            return;
        }

        wp_enqueue_style(
            'silentauth',
            SILENTAUTH_PLUGIN_URL . 'assets/css/silentauth.css',
            [],
            SILENTAUTH_VERSION
        );

        wp_enqueue_script(
            'silentauth',
            SILENTAUTH_PLUGIN_URL . 'assets/js/silentauth.js',
            [],
            SILENTAUTH_VERSION,
            true
        );

        wp_localize_script('silentauth', 'silentauth_config', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'api_url'  => rtrim(get_option('silentauth_api_url', ''), '/'),
            'nonce'    => wp_create_nonce('silentauth_nonce'),
        ]);
    }

    /**
     * Render [silentauth] shortcode.
     */
    public function render_shortcode($atts): string {
        $atts = shortcode_atts([
            'text' => get_option('silentauth_button_text', 'Verify'),
        ], $atts, 'silentauth');

        $id = 'sa-' . wp_rand(1000, 9999);

        return sprintf(
            '<div class="silentauth-wrap" id="%s">' .
                '<input type="hidden" name="silentauth_token" value="" />' .
                '<button type="button" class="silentauth-btn" data-sa-id="%s">%s</button>' .
            '</div>',
            esc_attr($id),
            esc_attr($id),
            esc_html($atts['text'])
        );
    }

    /**
     * AJAX: create a session via SilentAuth API.
     */
    public function ajax_create_session(): void {
        check_ajax_referer('silentauth_nonce', 'nonce');

        $api = new SilentAuth_API();
        $result = $api->create_session();

        if (is_wp_error($result)) {
            wp_send_json_error(['message' => $result->get_error_message()], 500);
        }

        wp_send_json_success([
            'token' => $result['token'] ?? '',
        ]);
    }
}
