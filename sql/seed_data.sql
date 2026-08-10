-- Clear existing data
TRUNCATE public.shows CASCADE;
TRUNCATE public.seats CASCADE;
TRUNCATE public.screens CASCADE;
TRUNCATE public.theatres CASCADE;
TRUNCATE public.movies CASCADE;
-- Variable
DO $$
DECLARE
  v_movie_0 bigint := 1;
  v_movie_1 bigint := 2;
  v_movie_2 bigint := 3;
  v_movie_3 bigint := 4;
  v_movie_4 bigint := 5;
  v_movie_5 bigint := 6;
  v_movie_6 bigint := 7;
  v_movie_7 bigint := 8;
  v_theatre_0 bigint := 1;
  v_theatre_1 bigint := 2;
  v_theatre_2 bigint := 3;
  v_screen_0 bigint := 1;
  v_screen_1 bigint := 2;
  v_screen_2 bigint := 3;
  v_screen_3 bigint := 4;
BEGIN

  INSERT INTO public.movies (id, title, synopsis, genres, language, duration_mins, rating, certificate, release_date, poster_url, backdrop_url, trailer_url, cast_json, status)
  VALUES (v_movie_0, 'Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.', ARRAY['Sci-Fi','Drama','Adventure'], 'English', 169, 8.6, 'UA', '2014-11-05', '/images/Interstellar_film_poster.jpg', '/images/interstellar_backdrop.jpg', 'https://www.youtube.com/embed/zSWdZVtXT7E', '[{"name":"Matthew McConaughey","role":"Cooper","photo":"/images/c_matthew.jpg"},{"name":"Anne Hathaway","role":"Brand","photo":"/images/c_anne.jpg"},{"name":"Jessica Chastain","role":"Murph","photo":"/images/c_jessica.jpg"},{"name":"Michael Caine","role":"Prof. Brand","photo":"/images/c_michael.jpg"},{"name":"Matt Damon","role":"Mann","photo":"/images/c_matt.jpg"}]'::jsonb, 'now_showing');
  INSERT INTO public.movies (id, title, synopsis, genres, language, duration_mins, rating, certificate, release_date, poster_url, backdrop_url, trailer_url, cast_json, status)
  VALUES (v_movie_1, 'The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', ARRAY['Action','Thriller','Drama'], 'English', 152, 9, 'UA', '2008-07-16', '/images/m2_poster.jpg', '/images/m2_backdrop.jpg', 'https://www.youtube.com/embed/EXeTwQWrcwY', '[{"name":"Christian Bale","role":"Bruce Wayne / Batman","photo":"/images/c_christian.jpg"},{"name":"Heath Ledger","role":"Joker","photo":"/images/c_heath.jpg"}]'::jsonb, 'now_showing');
  INSERT INTO public.movies (id, title, synopsis, genres, language, duration_mins, rating, certificate, release_date, poster_url, backdrop_url, trailer_url, cast_json, status)
  VALUES (v_movie_2, 'Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', ARRAY['Sci-Fi','Action','Thriller'], 'English', 148, 8.8, 'UA', '2010-07-15', '/images/m3_poster.jpg', '/images/m3_backdrop.jpg', 'https://www.youtube.com/embed/YoHD9XEInc0', '[{"name":"Leonardo DiCaprio","role":"Cobb","photo":"/images/c_leo.jpg"},{"name":"Joseph Gordon-Levitt","role":"Arthur","photo":"/images/c_joseph.jpg"}]'::jsonb, 'now_showing');
  INSERT INTO public.movies (id, title, synopsis, genres, language, duration_mins, rating, certificate, release_date, poster_url, backdrop_url, trailer_url, cast_json, status)
  VALUES (v_movie_3, 'Dune: Part Two', 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.', ARRAY['Sci-Fi','Action','Adventure'], 'English', 166, 8.8, 'UA', '2024-02-28', '/images/m4_poster.jpg', '/images/m4_backdrop.jpg', 'https://www.youtube.com/embed/Way9Dexny3w', '[{"name":"Timothée Chalamet","role":"Paul Atreides","photo":"/images/c_timothee.jpg"},{"name":"Zendaya","role":"Chani","photo":"/images/c_zendaya.jpg"}]'::jsonb, 'now_showing');
  INSERT INTO public.movies (id, title, synopsis, genres, language, duration_mins, rating, certificate, release_date, poster_url, backdrop_url, trailer_url, cast_json, status)
  VALUES (v_movie_4, 'Oppenheimer', 'The story of American scientist, J. Robert Oppenheimer, and his role in the development of the atomic bomb.', ARRAY['Drama','History'], 'English', 180, 8.5, 'UA', '2023-07-19', '/images/m5_poster.jpg', '/images/m5_backdrop.jpg', 'https://www.youtube.com/embed/bK6ldnjE3Y0', '[{"name":"Cillian Murphy","role":"J. Robert Oppenheimer","photo":"/images/c_cillian.jpg"},{"name":"Robert Downey Jr.","role":"Lewis Strauss","photo":"/images/c_robert.jpg"}]'::jsonb, 'coming_soon');
  INSERT INTO public.movies (id, title, synopsis, genres, language, duration_mins, rating, certificate, release_date, poster_url, backdrop_url, trailer_url, cast_json, status)
  VALUES (v_movie_5, 'Spider-Man: Across the Spider-Verse', 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.', ARRAY['Action','Adventure','Animation'], 'English', 140, 8.7, 'U', '2023-05-31', '/images/m6_poster.jpg', '/images/m6_backdrop.jpg', 'https://www.youtube.com/embed/shW9i6k8cB0', '[{"name":"Shameik Moore","role":"Miles Morales (voice)","photo":"/images/c_shameik.jpg"},{"name":"Hailee Steinfeld","role":"Gwen Stacy (voice)","photo":"/images/c_hailee.jpg"}]'::jsonb, 'coming_soon');
  INSERT INTO public.movies (id, title, synopsis, genres, language, duration_mins, rating, certificate, release_date, poster_url, backdrop_url, trailer_url, cast_json, status)
  VALUES (v_movie_6, 'La La Land', 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.', ARRAY['Romance','Comedy','Drama'], 'English', 128, 8, 'UA', '2016-12-09', '/images/m7_poster.jpg', '/images/m7_backdrop.jpg', 'https://www.youtube.com/embed/0pdqf4P9MB8', '[{"name":"Ryan Gosling","role":"Sebastian","photo":"/images/c_ryan.jpg"},{"name":"Emma Stone","role":"Mia","photo":"/images/c_emma.jpg"}]'::jsonb, 'now_showing');
  INSERT INTO public.movies (id, title, synopsis, genres, language, duration_mins, rating, certificate, release_date, poster_url, backdrop_url, trailer_url, cast_json, status)
  VALUES (v_movie_7, 'The Grand Budapest Hotel', 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel''s glorious years under an exceptional concierge.', ARRAY['Comedy','Adventure','Drama'], 'English', 99, 8.1, 'UA', '2014-03-28', '/images/m8_poster.jpg', '/images/m8_backdrop.jpg', 'https://www.youtube.com/embed/1Fg5iWmQjwk', '[{"name":"Ralph Fiennes","role":"M. Gustave","photo":"/images/c_ralph.jpg"},{"name":"Tony Revolori","role":"Zero","photo":"/images/c_tony.jpg"}]'::jsonb, 'coming_soon');

END $$;
