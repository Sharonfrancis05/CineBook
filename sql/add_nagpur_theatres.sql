DO $$
DECLARE
    v_pvr_id BIGINT := 10;
    v_inox_id BIGINT := 11;
    v_cinepolis_id BIGINT := 12;
    
    v_pvr_sc1 BIGINT := 20;
    v_pvr_sc2 BIGINT := 21;
    v_inox_sc1 BIGINT := 22;
    v_cinepolis_sc1 BIGINT := 23;
    
    v_screen BIGINT;
    r CHAR;
    s INT;
    v_tier text;
BEGIN
    -- 1. Insert Theatres (Translated to our schema's UUID format)
    INSERT INTO public.theatres (id, name, city, address, contact_phone) VALUES
    (v_pvr_id, 'PVR Cinemas', 'Nagpur', 'Empress Mall, Nagpur', '9876543210'),
    (v_inox_id, 'INOX', 'Nagpur', 'Eternity Mall, Nagpur', '9876543211'),
    (v_cinepolis_id, 'Cinepolis', 'Nagpur', 'VR Mall, Nagpur', '9876543212');

    -- 2. Insert Screens (Translated to our schema)
    INSERT INTO public.screens (id, theatre_id, name, total_seats) VALUES
    (v_pvr_sc1, v_pvr_id, 'Screen 1 (2D)', 100),
    (v_pvr_sc2, v_pvr_id, 'Screen 2 (3D)', 120),
    (v_inox_sc1, v_inox_id, 'Screen 1 (IMAX)', 150),
    (v_cinepolis_sc1, v_cinepolis_id, 'Screen 1 (2D)', 80);

    -- 3. Generate Seats for these 4 new screens
    -- This perfectly creates the A-H rows and assigns Standard & Premium to match your previous setup!
    FOREACH v_screen IN ARRAY ARRAY[v_pvr_sc1, v_pvr_sc2, v_inox_sc1, v_cinepolis_sc1] LOOP
        FOREACH r IN ARRAY ARRAY['A','B','C','D','E','F','G','H'] LOOP
            -- Make G and H premium, rest standard
            IF r IN ('G', 'H') THEN v_tier := 'premium'; ELSE v_tier := 'standard'; END IF;
            
            FOR s IN 1..12 LOOP
                INSERT INTO public.seats (screen_id, row_label, seat_number, tier)
                VALUES (v_screen, r, s, v_tier::seat_tier)
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
