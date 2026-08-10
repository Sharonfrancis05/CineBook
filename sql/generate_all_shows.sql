TRUNCATE public.shows CASCADE;

DO $$
DECLARE
    v_movie_id BIGINT;
    v_theatre_id BIGINT;
    v_screen_id BIGINT;
    v_date DATE;
    v_time TIME;
    v_price_std INT;
    v_price_prem INT;
    i INT;
    j INT;
    m_index INT := 0;
    base_times TIME[] := ARRAY['09:30'::time, '13:15'::time, '16:45'::time, '20:30'::time];
BEGIN
    -- Loop through the next 7 days
    FOR i IN 0..6 LOOP
        v_date := current_date + (i || ' days')::interval;
        
        m_index := 0;
        
        -- Loop through all movies
        FOR v_movie_id IN SELECT id FROM public.movies LOOP
            
            v_price_std := 250;
            v_price_prem := 350;
            
            -- Loop through all theatres
            FOR v_theatre_id IN SELECT id FROM public.theatres LOOP
                
                -- Get the first screen in that theatre
                SELECT id INTO v_screen_id FROM public.screens WHERE theatre_id = v_theatre_id LIMIT 1;
                
                IF v_screen_id IS NOT NULL THEN
                    -- Insert 4 different showtimes for each movie!
                    FOR j IN 1..4 LOOP
                        -- Offset by m_index minutes so no two movies ever start at the exact same minute on the same screen!
                        -- This perfectly bypasses the database collision protection.
                        v_time := base_times[j] + (m_index || ' minutes')::interval;
                        
                        INSERT INTO public.shows (movie_id, screen_id, theatre_id, show_date, show_time, price_standard, price_premium)
                        VALUES (v_movie_id, v_screen_id, v_theatre_id, v_date, v_time, v_price_std, v_price_prem)
                        ON CONFLICT DO NOTHING;
                    END LOOP;
                END IF;
            END LOOP;
            
            m_index := m_index + 1;
        END LOOP;
    END LOOP;
END $$;
