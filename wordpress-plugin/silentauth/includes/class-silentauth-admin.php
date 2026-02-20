<?php

if (!defined('ABSPATH')) {
    exit;
}

class SilentAuth_Admin {

    public function add_settings_page(): void {
        add_options_page(
            'SilentAuth Settings',
            'SilentAuth',
            'manage_options',
            'silentauth',
            [$this, 'render_settings_page']
        );
    }

    public function register_settings(): void {
        register_setting('silentauth_settings', 'silentauth_api_url', [
            'sanitize_callback' => 'esc_url_raw',
            'default'           => '',
        ]);
        register_setting('silentauth_settings', 'silentauth_api_key', [
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]);
        register_setting('silentauth_settings', 'silentauth_button_text', [
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => 'Verify',
        ]);

        add_settings_section('silentauth_main', 'API Configuration', null, 'silentauth');

        add_settings_field('silentauth_api_url', 'API URL', [$this, 'render_api_url_field'], 'silentauth', 'silentauth_main');
        add_settings_field('silentauth_api_key', 'API Key', [$this, 'render_api_key_field'], 'silentauth', 'silentauth_main');
        add_settings_field('silentauth_button_text', 'Button Text', [$this, 'render_button_text_field'], 'silentauth', 'silentauth_main');
    }

    public function render_api_url_field(): void {
        $value = get_option('silentauth_api_url', '');
        echo '<input type="url" name="silentauth_api_url" value="' . esc_attr($value) . '" class="regular-text" placeholder="http://155.138.128.67:4000" />';
        echo '<p class="description">SilentAuth backend API URL</p>';
    }

    public function render_api_key_field(): void {
        $value = get_option('silentauth_api_key', '');
        echo '<input type="text" name="silentauth_api_key" value="' . esc_attr($value) . '" class="regular-text" placeholder="sa_..." />';
        echo '<p class="description">API key from your SilentAuth project</p>';
    }

    public function render_button_text_field(): void {
        $value = get_option('silentauth_button_text', 'Verify');
        echo '<input type="text" name="silentauth_button_text" value="' . esc_attr($value) . '" class="regular-text" />';
    }

    public function render_settings_page(): void {
        if (!current_user_can('manage_options')) {
            return;
        }
        ?>
        <div class="wrap">
            <h1>SilentAuth Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('silentauth_settings');
                do_settings_sections('silentauth');
                submit_button();
                ?>
            </form>
            <hr />
            <h2>Usage</h2>
            <p>Add the shortcode <code>[silentauth]</code> inside any form to render the verification button.</p>
            <p>In your form handler, validate with:</p>
            <pre><code>if (!silentauth_is_verified($_POST['silentauth_token'])) {
    wp_die('Verification failed');
}</code></pre>
        </div>
        <?php
    }
}
