import React, { useState } from 'react';
import Filmkort from './Filmkort';

const filmer = [
  { id: 1, tittel: 'Inception', sjanger: 'Sci-fi', aar: 2010, rating: 8.8 },
  { id: 2, tittel: 'The Lion King', sjanger: 'Animasjon', aar: 1994, rating: 8.5 },
  { id: 3, tittel: 'Parasite', sjanger: 'Thriller', aar: 2019, rating: 8.6 },
  { id: 4, tittel: 'Toy Story', sjanger: 'Animasjon', aar: 1995, rating: 8.3 },
  { id: 5, tittel: 'The Dark Knight', sjanger: 'Action', aar: 2008, rating: 9.0 },
  { id: 6, tittel: 'Spirited Away', sjanger: 'Animasjon', aar: 2001, rating: 8.6 }
];

function App() {
  const [valgt, setValgt] = useState('Alle');
  const [favoritter, setFavoritter] = useState([]);
  const [visKunFavoritter, setVisKunFavoritter] = useState(false);

  const toggleFavoritt = id => {
    setFavoritter(prev =>
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const filtrerteFilmer = filmer
    .filter(film => valgt === 'Alle' || film.sjanger === valgt)
    .filter(film => !visKunFavoritter || favoritter.includes(film.id));

  return (
    <div>
      <h1>Filmkatalog</h1>
      <p>Du har {favoritter.length} favoritt(er)</p>

      <div>
        <button className={valgt === 'Alle' ? 'aktiv' : ''} onClick={() => setValgt('Alle')}>Alle</button>
        <button className={valgt === 'Sci-fi' ? 'aktiv' : ''} onClick={() => setValgt('Sci-fi')}>Sci-fi</button>
        <button className={valgt === 'Animasjon' ? 'aktiv' : ''} onClick={() => setValgt('Animasjon')}>Animasjon</button>
        <button className={valgt === 'Action' ? 'aktiv' : ''} onClick={() => setValgt('Action')}>Action</button>
        <button className={valgt === 'Thriller' ? 'aktiv' : ''} onClick={() => setValgt('Thriller')}>Thriller</button>
      </div>

      <div>
        <button onClick={() => setVisKunFavoritter(prev => !prev)}>
          {visKunFavoritter ? 'Vis alle' : 'Vis kun favoritter'}
        </button>
      </div>

      {filtrerteFilmer.length === 0 ? (
        <p>Ingen filmer i denne sjangeren</p>
      ) : (
        <ul>
          {filtrerteFilmer.map(film => (
            <li key={film.id}>
              <Filmkort
                film={film}
                erFavoritt={favoritter.includes(film.id)}
                toggleFavoritt={toggleFavoritt}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
