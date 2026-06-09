function Filmkort({ film, erFavoritt, onToggleFavoritt }) {
  return (
    <article className={`filmkort ${erFavoritt ? 'favoritt' : ''}`}>
      <h3>{film.tittel}</h3>
      <p>Sjanger: {film.sjanger}</p>
      <p>År: {film.aar}</p>
      <p>Rating: {film.rating}</p>
      {film.rating >= 8.7 && <p className="topprangert">Topprangert</p>}

      <button onClick={() => onToggleFavoritt(film.id)}>
        {erFavoritt ? '💔 Fjern favoritt' : '❤ Favoritt'}
      </button>
    </article>
  )
}

export default Filmkort