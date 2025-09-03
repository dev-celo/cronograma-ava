import React, { useEffect, useState } from "react";

// Cronograma Lei Seca — versão completa, aproveitando 100% do JSON fornecido
// Estrutura: Header, Sidebar Esquerda, Conteúdo Central (agenda), Sidebar Direita (estratégia, prioridades), Rodapé (meta/observações/fontes)

const STORAGE_KEYS = {
  anotacoes: "cronograma.anotacoes",
  materiais: "cronograma.materiais",
  progresso: "cronograma.progresso",
  favoritos: "cronograma.favoritos",
  meta: "cronograma.meta"
};

// JSON base importado (poderia ser carregado via fetch/local)
import cronogramaBase from "./cronograma.json"; // coloque o arquivo JSON no mesmo diretório

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function CronogramaApp() {
  const [cronograma, setCronograma] = useState(() => loadFromStorage(STORAGE_KEYS.meta, cronogramaBase));
  const [anotacoes, setAnotacoes] = useState(() => loadFromStorage(STORAGE_KEYS.anotacoes, {}));
  const [materiais, setMateriais] = useState(() => loadFromStorage(STORAGE_KEYS.materiais, []));
  const [progresso, setProgresso] = useState(() => loadFromStorage(STORAGE_KEYS.progresso, {}));
  const [favoritos, setFavoritos] = useState(() => loadFromStorage(STORAGE_KEYS.favoritos, []));
  const [activeDay, setActiveDay] = useState("segunda");
  const [newNote, setNewNote] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => saveToStorage(STORAGE_KEYS.meta, cronograma), [cronograma]);
  useEffect(() => saveToStorage(STORAGE_KEYS.anotacoes, anotacoes), [anotacoes]);
  useEffect(() => saveToStorage(STORAGE_KEYS.materiais, materiais), [materiais]);
  useEffect(() => saveToStorage(STORAGE_KEYS.progresso, progresso), [progresso]);
  useEffect(() => saveToStorage(STORAGE_KEYS.favoritos, favoritos), [favoritos]);

  function toggleProgress(day, blocoIndex, item) {
    const key = `${day}.${blocoIndex}.${item}`;
    const next = { ...progresso };
    next[key] = !next[key];
    setProgresso(next);
  }

  function handleAddNote(day) {
    if (!newNote.trim()) return;
    const next = { ...anotacoes };
    if (!next[day]) next[day] = [];
    next[day].push({ id: Date.now(), text: newNote });
    setAnotacoes(next);
    setNewNote("");
  }

  function handleSaveMaterial({ title, url, tags, day, disciplina, lei }) {
    const item = { id: Date.now(), title, url, tags, day, disciplina, lei };
    setMateriais(prev => [item, ...prev]);
  }

  function exportJSON() {
    const data = { cronograma, anotacoes, materiais, progresso, favoritos };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cronograma-lei-seca.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.cronograma) setCronograma(data.cronograma);
        if (data.anotacoes) setAnotacoes(data.anotacoes);
        if (data.materiais) setMateriais(data.materiais);
        if (data.progresso) setProgresso(data.progresso);
        if (data.favoritos) setFavoritos(data.favoritos);
      } catch {
        alert("Arquivo inválido");
      }
    };
    reader.readAsText(file);
  }

  function renderDay(dayKey) {
    const day = cronograma.agenda_semanal[dayKey];
    if (!day) return null;
    return (
      <div className="bg-white rounded-2xl shadow p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">{day.nome}</h3>
        {day.blocos?.map((b, i) => (
          <div key={i} className="border rounded p-3 mb-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{b.foco}</div>
                <div className="text-sm text-gray-600">{b.duracao}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {b.links?.map((l, idx) => (
                    <a key={idx} href={l.u} target="_blank" rel="noreferrer" className="text-sm underline">{l.t}</a>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">Checklist</div>
                <ul className="text-sm">
                  {b.checklist?.map((ch, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <input type="checkbox" checked={!!progresso[`${dayKey}.${i}.${idx}`]} onChange={() => toggleProgress(dayKey, i, idx)} />
                      <span>{ch}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
        <div className="mt-2">
          <h4 className="font-medium">Anotações</h4>
          <div className="flex gap-2 mt-2">
            <input className="flex-1 border rounded p-2" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Escreva uma nota rápida..." />
            <button className="bg-blue-600 text-white px-3 rounded" onClick={() => handleAddNote(dayKey)}>Salvar</button>
          </div>
          <ul className="mt-3">
            {(anotacoes[dayKey] || []).map(n => (
              <li key={n.id} className="text-sm bg-gray-50 p-2 rounded mb-2">{n.text}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-6">
        {/* Sidebar esquerda */}
        <aside className="md:col-span-1 bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold mb-3">Dias</h2>
          <ul className="flex flex-col gap-2">
            {Object.keys(cronograma.agenda_semanal).map(k => (
              <li key={k}>
                <button className={`w-full text-left p-2 rounded ${activeDay===k ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'}`} onClick={() => setActiveDay(k)}>
                  {cronograma.agenda_semanal[k].nome}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <h3 className="font-medium">Favoritos</h3>
            <ul className="text-sm mt-2">
              {favoritos.length === 0 ? <li className="text-gray-500">Nenhum favorito</li> : favoritos.map((f, idx) => <li key={idx}><a href={f.u} target="_blank" rel="noreferrer" className="underline">{f.t}</a></li>)}
            </ul>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <section className="md:col-span-4">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Cronograma Lei Seca (FCC)</h1>
              <p className="text-sm text-gray-600">3h/dia em 2 blocos — Salvo no localStorage</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={exportJSON}>Exportar JSON</button>
              <label className="bg-white border px-3 py-2 rounded cursor-pointer">
                Importar JSON
                <input type="file" accept="application/json" className="hidden" onChange={e => importJSON(e.target.files[0])} />
              </label>
            </div>
          </header>

          {renderDay(activeDay)}

          {/* Materiais */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-2">Materiais</h3>
            <MaterialForm onSave={handleSaveMaterial} />
            <input value={filter} onChange={e => setFilter(e.target.value)} className="w-full border rounded p-2 mt-3" placeholder="Filtrar por título/tags/dia" />
            <ul className="mt-3">
              {materiais.filter(m => !filter || (m.title+m.tags+m.day).toLowerCase().includes(filter.toLowerCase())).map(mat => (
                <li key={mat.id} className="border rounded p-2 mb-2 flex justify-between">
                  <div>
                    <a href={mat.url} target="_blank" rel="noreferrer" className="font-medium underline">{mat.title}</a>
                    <div className="text-sm text-gray-600">{mat.disciplina} • {mat.lei} • {mat.day}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="text-sm bg-blue-600 text-white px-2 py-1 rounded" onClick={() => setFavoritos(prev => [{t: mat.title, u: mat.url}, ...prev])}>Favoritar</button>
                    <button className="text-sm bg-red-100 px-2 py-1 rounded" onClick={() => setMateriais(prev => prev.filter(p => p.id !== mat.id))}>Remover</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sidebar direita: Estratégia, prioridades, fontes */}
        <aside className="md:col-span-1 bg-white p-4 rounded-2xl shadow overflow-auto max-h-screen">
          <h3 className="font-semibold mb-3">Estratégia de Estudo</h3>
          <ul className="text-sm mb-4">
            {cronograma.funcoes_estudo?.sugestao_tecnica?.map((s, idx) => <li key={idx}>• {s}</li>)}
          </ul>
          <h4 className="font-medium">Métricas</h4>
          <ul className="text-sm mb-4">
            {cronograma.funcoes_estudo?.metrica_de_progresso?.map((s, idx) => <li key={idx}>• {s}</li>)}
          </ul>
          <h4 className="font-medium">Heurística FCC</h4>
          <ul className="text-sm mb-4">
            {cronograma.funcoes_estudo?.heuristica_FCC?.map((s, idx) => <li key={idx}>• {s}</li>)}
          </ul>

          <h3 className="font-semibold mb-3">Prioridades — {activeDay}</h3>
          <ul className="text-sm mb-4">
            {Object.entries(cronograma.prioridades_por_disciplina).map(([disc, lista]) => (
              <li key={disc} className="mb-2">
                <div className="font-medium">{disc}</div>
                <ul className="ml-3 list-disc">
                  {lista.map((p, idx) => <li key={idx}>{p}</li>)}
                </ul>
              </li>
            ))}
          </ul>

          <h3 className="font-semibold mb-3">Fontes</h3>
          {Object.entries(cronograma.meta.fontes_prioridade).map(([disc, links]) => (
            <div key={disc} className="mb-3">
              <div className="font-medium">{disc}</div>
              <ul className="text-sm ml-3 list-disc">
                {links.map((l, idx) => <li key={idx}><a href={l} className="underline" target="_blank" rel="noreferrer">{l}</a></li>)}
              </ul>
            </div>
          ))}

          <h3 className="font-semibold mb-3">Observações Globais</h3>
          <ul className="text-sm">
            {cronograma.meta.observacoes_globais?.map((o, idx) => <li key={idx}>• {o}</li>)}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function MaterialForm({ onSave }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [day, setDay] = useState("segunda");
  const [disciplina, setDisciplina] = useState("");
  const [lei, setLei] = useState("");

  function submit(e) {
    e.preventDefault();
    onSave({ title, url, tags: tags.split(",").map(t => t.trim()).filter(Boolean), day, disciplina, lei });
    setTitle(""); setUrl(""); setTags(""); setLei("");
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-2">
      <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} className="border rounded p-2" required />
      <input placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} className="border rounded p-2" required />
      <input placeholder="Tags (,)" value={tags} onChange={e => setTags(e.target.value)} className="border rounded p-2" />
      <input placeholder="Disciplina" value={disciplina} onChange={e => setDisciplina(e.target.value)} className="border rounded p-2" />
      <input placeholder="Lei" value={lei} onChange={e => setLei(e.target.value)} className="border rounded p-2" />
      <select value={day} onChange={e => setDay(e.target.value)} className="border rounded p-2">
        {Object.keys(cronogramaBase.agenda_semanal).map(k => <option key={k} value={k}>{k}</option>)}
      </select>
      <button className="bg-gray-800 text-white px-3 py-2 rounded" type="submit">Salvar</button>
    </form>
  );
}
