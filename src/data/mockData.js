export const mockMovies = [
  {
    id: 'm1',
    title: 'Interstellar',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    language: 'English',
    duration_mins: 169,
    rating: 8.6,
    certificate: 'UA',
    release_date: '2014-11-05',
    poster_url: '/images/m1_poster.jpg',
    backdrop_url: '/images/m1_backdrop.jpg',
    trailer_url: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    synopsis: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper', photo: '/images/c_matthew.jpg' },
      { name: 'Anne Hathaway', role: 'Brand', photo: '/images/c_anne.jpg' },
      { name: 'Jessica Chastain', role: 'Murph', photo: '/images/c_jessica.jpg' },
      { name: 'Michael Caine', role: 'Prof. Brand', photo: '/images/c_michael.jpg' },
      { name: 'Matt Damon', role: 'Mann', photo: '/images/c_matt.jpg' },
    ],
    status: 'now_showing',
  },
  {
    id: 'm2',
    title: 'The Dark Knight',
    genres: ['Action', 'Thriller', 'Drama'],
    language: 'English',
    duration_mins: 152,
    rating: 9.0,
    certificate: 'UA',
    release_date: '2008-07-16',
    poster_url: '/images/m2_poster.jpg',
    backdrop_url: '/images/m2_backdrop.jpg',
    trailer_url: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    cast: [
      { name: 'Christian Bale', role: 'Bruce Wayne / Batman', photo: '/images/c_christian.jpg' },
      { name: 'Heath Ledger', role: 'Joker', photo: '/images/c_heath.jpg' },
    ],
    status: 'now_showing',
  },
  {
    id: 'm3',
    title: 'Inception',
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    language: 'English',
    duration_mins: 148,
    rating: 8.8,
    certificate: 'UA',
    release_date: '2010-07-15',
    poster_url: '/images/m3_poster.jpg',
    backdrop_url: '/images/m3_backdrop.jpg',
    trailer_url: 'https://www.youtube.com/embed/YoHD9XEInc0',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    cast: [
      { name: 'Leonardo DiCaprio', role: 'Cobb', photo: '/images/c_leo.jpg' },
      { name: 'Joseph Gordon-Levitt', role: 'Arthur', photo: '/images/c_joseph.jpg' },
    ],
    status: 'now_showing',
  },
  {
    id: 'm4',
    title: 'Dune: Part Two',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    language: 'English',
    duration_mins: 166,
    rating: 8.8,
    certificate: 'UA',
    release_date: '2024-02-28',
    poster_url: '/images/m4_poster.jpg',
    backdrop_url: '/images/m4_backdrop.jpg',
    trailer_url: 'https://www.youtube.com/embed/Way9Dexny3w',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', photo: '/images/c_timothee.jpg' },
      { name: 'Zendaya', role: 'Chani', photo: '/images/c_zendaya.jpg' },
    ],
    status: 'now_showing',
  },
  {
    id: 'm5',
    title: 'Oppenheimer',
    genres: ['Drama', 'History'],
    language: 'English',
    duration_mins: 180,
    rating: 8.5,
    certificate: 'UA',
    release_date: '2023-07-19',
    poster_url: '/images/m5_poster.jpg',
    backdrop_url: '/images/m5_backdrop.jpg',
    trailer_url: 'https://www.youtube.com/embed/bK6ldnjE3Y0',
    synopsis: 'The story of American scientist, J. Robert Oppenheimer, and his role in the development of the atomic bomb.',
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', photo: '/images/c_cillian.jpg' },
      { name: 'Robert Downey Jr.', role: 'Lewis Strauss', photo: '/images/c_robert.jpg' },
    ],
    status: 'coming_soon',
  },
  {
    id: 'm6',
    title: 'Spider-Man: Across the Spider-Verse',
    genres: ['Action', 'Adventure', 'Animation'],
    language: 'English',
    duration_mins: 140,
    rating: 8.7,
    certificate: 'U',
    release_date: '2023-05-31',
    poster_url: '/images/m6_poster.jpg',
    backdrop_url: '/images/m6_backdrop.jpg',
    trailer_url: 'https://www.youtube.com/embed/shW9i6k8cB0',
    synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    cast: [
      { name: 'Shameik Moore', role: 'Miles Morales (voice)', photo: '/images/c_shameik.jpg' },
      { name: 'Hailee Steinfeld', role: 'Gwen Stacy (voice)', photo: '/images/c_hailee.jpg' },
    ],
    status: 'coming_soon',
  },
  {
    id: 'm7',
    title: 'La La Land',
    genres: ['Romance', 'Comedy', 'Drama'],
    language: 'English',
    duration_mins: 128,
    rating: 8.0,
    certificate: 'UA',
    release_date: '2016-12-09',
    poster_url: '/images/m7_poster.jpg',
    backdrop_url: '/images/m7_backdrop.jpg',
    trailer_url: 'https://www.youtube.com/embed/0pdqf4P9MB8',
    synopsis: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
    cast: [
      { name: 'Ryan Gosling', role: 'Sebastian', photo: '/images/c_ryan.jpg' },
      { name: 'Emma Stone', role: 'Mia', photo: '/images/c_emma.jpg' },
    ],
    status: 'now_showing',
  },
  {
    id: 'm8',
    title: 'The Grand Budapest Hotel',
    genres: ['Comedy', 'Adventure', 'Drama'],
    language: 'English',
    duration_mins: 99,
    rating: 8.1,
    certificate: 'UA',
    release_date: '2014-03-28',
    poster_url: '/images/m8_poster.jpg',
    backdrop_url: '/images/m8_backdrop.jpg',
    trailer_url: 'https://www.youtube.com/embed/1Fg5iWmQjwk',
    synopsis: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel\'s glorious years under an exceptional concierge.',
    cast: [
      { name: 'Ralph Fiennes', role: 'M. Gustave', photo: '/images/c_ralph.jpg' },
      { name: 'Tony Revolori', role: 'Zero', photo: '/images/c_tony.jpg' },
    ],
    status: 'coming_soon',
  },
]

export const mockTheatres = [
  { id: 't1', name: 'CineBook Grand', city: 'Mumbai', address: 'Andheri West, Mumbai' },
  { id: 't2', name: 'CineBook IMAX — Riverside', city: 'Mumbai', address: 'Bandra West, Mumbai' },
  { id: 't3', name: 'CineBook Lite', city: 'Mumbai', address: 'Juhu Beach, Mumbai' },
]

const screenLayout = { rows: 8, seatsPerRow: 12, aisleAfter: [3, 8] }

export const mockScreens = [
  { id: 's1', theatre_id: 't1', name: 'Screen 1', type: 'Standard', layout: screenLayout },
  { id: 's2', theatre_id: 't1', name: 'Screen 2 — Recliner', type: 'Recliner', layout: screenLayout },
  { id: 's3', theatre_id: 't2', name: 'IMAX Screen', type: 'IMAX', layout: screenLayout },
  { id: 's4', theatre_id: 't3', name: 'Screen 1', type: 'Standard', layout: screenLayout },
]

function genShowtimes(movieId) {
  const times = ['10:00 AM', '1:15 PM', '4:30 PM', '7:45 PM', '10:30 PM']
  return mockScreens.map((screen, i) => ({
    id: `show-${movieId}-${screen.id}`,
    movie_id: movieId,
    screen_id: screen.id,
    theatre_id: screen.theatre_id,
    show_date: '2026-08-07',
    show_time: times[i % times.length],
    price_standard: screen.type === 'IMAX' ? 380 : screen.type === 'Recliner' ? 450 : 220,
    price_premium: screen.type === 'IMAX' ? 550 : screen.type === 'Recliner' ? 600 : 320,
  }))
}

export const mockShowtimes = mockMovies
  .filter((m) => m.status === 'now_showing')
  .flatMap((m) => genShowtimes(m.id))

export function generateSeatMap(showId, bookedSeatIds = []) {
  const { rows, seatsPerRow } = screenLayout
  const rowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i))
  const seats = []
  rowLabels.forEach((row, rIdx) => {
    for (let n = 1; n <= seatsPerRow; n++) {
      const id = `${row}${n}`
      const tier = rIdx < 2 ? 'premium' : 'standard'
      seats.push({
        id,
        row,
        number: n,
        tier,
        status: bookedSeatIds.includes(id) ? 'booked' : 'available',
      })
    }
  })
  return seats
}

export const mockBookings = []
