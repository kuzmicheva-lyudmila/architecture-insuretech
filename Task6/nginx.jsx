http {
    upstream backend_servers {
        server backend1.example.com;
        server backend2.example.com;
        server backend3.example.com;
    }

    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/m;

    map $remote_addr $apply_limit {
        default 0;
        192.0.2.10 1;   # IP партнёра
        203.0.113.5 1;  # Ещё один IP партнёра
    }

    server {
        listen 80;

        location / {
            if ($apply_limit) {
                limit_req zone=api_limit burst=5 nodelay;
            }

            proxy_pass http://backend_servers;
            error_page 429 = @rate_limited;
        }

        location @rate_limited {
            return 429 "Rate limit exceeded. Please try again later.\n";
        }
    }
}
