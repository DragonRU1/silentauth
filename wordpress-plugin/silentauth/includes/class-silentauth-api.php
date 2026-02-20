<?php

if (!defined('ABSPATH')) {
    exit;
}

class SilentAuth_API {

    private string $api_url;
    private string $api_key;

    public function __construct() {
        $this->api_url = rtrim(get_option('silentauth_api_url', ''), '/');
        $this->api_key = get_option('silentauth_api_key', '');
    }

    /**
     * Create a new verification session.
     * @return array|WP_Error Session data or error.
     */
    public function create_session(): array|object {
        $response = wp_remote_post($this->api_url . '/api/sessions', [
            'headers' => [
                'Content-Type' => 'application/json',
                'X-API-Key'    => $this->api_key,
            ],
            'body'    => wp_json_encode(new stdClass()),
            'timeout' => 15,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        $code = wp_remote_retrieve_response_code($response);

        if ($code !== 201 && $code !== 200) {
            return new WP_Error('silentauth_api', $body['error'] ?? 'Failed to create session');
        }

        return $body;
    }

    /**
     * Get session by token (public endpoint).
     * @return array|WP_Error Session data or error.
     */
    public function get_session(string $token): array|object {
        $response = wp_remote_get($this->api_url . '/api/sessions/' . urlencode($token), [
            'timeout' => 15,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        $code = wp_remote_retrieve_response_code($response);

        if ($code !== 200) {
            return new WP_Error('silentauth_api', $body['error'] ?? 'Session not found');
        }

        return $body;
    }
}
