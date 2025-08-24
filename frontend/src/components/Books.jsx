import React, { useEffect, useMemo, useState } from 'react'
import { apiGetList, apiCreate, apiUpdate, apiDelete } from '../api.js'

const PAGE_SIZE = 6

export default function Books(){
  const [books, setBooks]   = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [qInput, setQInput] = useState('')
  const [q, setQ]           = useState('')
  const [sort, setSort]     = useState('title')
  const [order, setOrder]   = useState('asc')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [title, setTitle]   = useState('')
  const [author, setAuthor] = useState('')
  const [year, setYear]     = useState('')

  // Debounce búsqueda
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setQ(qInput.trim()) }, 300)
    return () => clearTimeout(t)
  }, [qInput])

  function clampPage(p){
    const max = Math.max(1, Math.ceil(total / PAGE_SIZE))
    return Math.min(Math.max(1, p), max)
  }

  // Función de carga
  async function load(){
    setLoading(true); setError('')
    try{
      const { data, total } = await apiGetList('/books', {
        q, sort, order, offset:(page-1)*PAGE_SIZE, limit:PAGE_SIZE
      })
      setBooks(data); setTotal(total)
    }catch(e){ setError(e.message || 'Error al cargar') }
    finally{ setLoading(false) }
  }

  // Carga cada vez que cambian filtros o página 
  useEffect(() => { load() }, [q, sort, order, page])

  async function onCreate(e){
    e.preventDefault(); setError('')
    const payload = { title: title.trim(), author: author.trim(), year: Number(year), read:false }
    try{
      await apiCreate('/books', payload)
      setTitle(''); setAuthor(''); setYear('')
      await load()
    }catch(e){ setError(e.message || 'Error al crear') }
  }

  async function onToggle(id, current){
    setError('')
    try{ await apiUpdate(`/books/${id}`, { read: !current }); await load() }
    catch(e){ setError(e.message || 'Error al actualizar') }
  }

  async function onDelete(id){
    if(!confirm('¿Eliminar este libro?')) return
    setError('')
    try{
      await apiDelete(`/books/${id}`)

      // se elimina la llamada directa a load() y dejamos que useEffect recargue automáticamente
      const newTotal = Math.max(0, total - 1)
      const maxPage  = Math.max(1, Math.ceil(newTotal / PAGE_SIZE))
      setPage(p => Math.min(p, maxPage))
      
    }catch(e){ setError(e.message || 'Error al eliminar') }
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  return (
    <div className="page">
      {/* Panel izquierdo: explorar/listar */}
      <section className="card section">
        <h2 className="panel-title">Explorar</h2>

        <div className="toolbar">
          <div className="group">
            <label>Buscar por título o autor</label>
            <input
              type="text"
              placeholder="Escribe para buscar…"
              value={qInput}
              onChange={e => setQInput(e.target.value)}
              aria-label="Buscar"
            />
          </div>

          <div className="group">
            <label>Ordenar por</label>
            <div className="selectlike">
              {['title','author','year'].map(k => (
                <button
                  key={k}
                  type="button"
                  className={k===sort?'active':''}
                  onClick={() => { setPage(1); setSort(k) }}
                >
                  {k==='title'?'título':k==='author'?'autor':'año'}
                </button>
              ))}
            </div>
          </div>

          <div className="group">
            <label>Dirección</label>
            <div className="selectlike">
              <button type="button" className={order==='asc'?'active':''} onClick={() => { setPage(1); setOrder('asc') }}>asc</button>
              <button type="button" className={order==='desc'?'active':''} onClick={() => { setPage(1); setOrder('desc') }}>desc</button>
            </div>
          </div>
        </div>

        {error && <div role="alert" className="error">{error}</div>}

        {loading ? (
          <div className="loading" style={{marginTop:8}}><div className="spinner" /> Cargando…</div>
        ) : (
          <>
            <div className="list" role="list">
              {books.length===0 ? (
                <div className="empty">No hay resultados</div>
              ) : books.map(b => (
                <div key={b.id} className="item" role="listitem">
                  <div className="title">{b.title}</div>
                  <div className="muted">{b.author}</div>
                  <div className="muted">{b.year}</div>
                  <div><span className={"pill " + (b.read ? "ok":"no")}>{b.read ? "Leído":"No leído"}</span></div>
                  <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                    <button className="secondary" onClick={() => onToggle(b.id, b.read)}>
                      {b.read ? "Marcar como no leído" : "Marcar como leído"}
                    </button>
                    <button className="ghost" onClick={() => onDelete(b.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="footer">
              <div>Mostrando {books.length} de {total} • Página {page} de {totalPages}</div>
              <div>
                <button className="ghost" onClick={() => setPage(Math.max(1, page-1))} disabled={page<=1}>Anterior</button>
                <button className="ghost" onClick={() => setPage(Math.min(totalPages, page+1))} disabled={page>=totalPages}>Siguiente</button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Panel derecho: crear */}
      <section className="card section">
        <h2 className="panel-title">Agregar libro</h2>

        <form onSubmit={onCreate} className="form-grid">
          <div>
            <label htmlFor="title">Título</label>
            <input id="title" value={title} onChange={e=>setTitle(e.target.value)} required minLength={1} placeholder="Ej. Clean Code" />
          </div>
          <div>
            <label htmlFor="author">Autor</label>
            <input id="author" value={author} onChange={e=>setAuthor(e.target.value)} required minLength={1} placeholder="Ej. Robert C. Martin" />
          </div>
          <div>
            <label htmlFor="year">Año</label>
            <input id="year" type="number" value={year} onChange={e=>setYear(e.target.value)} required min={1500} max={2100} placeholder="2008" />
          </div>
          <div style={{textAlign:'right', marginTop:4}}>
            <button type="submit">Crear</button>
          </div>
        </form>

        <p className="muted" style={{marginTop:16}}>
          Se validan campos requeridos en el navegador. El backend aplica reglas de duplicados y validación adicional.
        </p>
      </section>
    </div>
  )
}
