import React, { useState, useEffect } from "react";
import cronogramaJson from "./cronograma.json";

export default function CronogramaApp() {
  const [data, setData] = useState(cronogramaJson);
  const [diaSelecionado, setDiaSelecionado] = useState("segunda");
  const [anotacoes, setAnotacoes] = useState({});
  const [materiais, setMateriais] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [progresso, setProgresso] = useState({});

  // carregar localStorage
  useEffect(() => {
    const anot = localStorage.getItem(data.config_ui.keys.anotacoes);
    const mat = localStorage.getItem(data.config_ui.keys.materiais);
    const fav = localStorage.getItem(data.config_ui.keys.favoritos);
    const prog = localStorage.getItem(data.config_ui.keys.progresso);
    if (anot) setAnotacoes(JSON.parse(anot));
    if (mat) setMateriais(JSON.parse(mat));
    if (fav) setFavoritos(JSON.parse(fav));
    if (prog) setProgresso(JSON.parse(prog));
  }, [data.config_ui.keys]);

  // salvar localStorage
  useEffect(() => {
    localStorage.setItem(data.config_ui.keys.anotacoes, JSON.stringify(anotacoes));
  }, [anotacoes]);

  useEffect(() => {
    localStorage.setItem(data.config_ui.keys.materiais, JSON.stringify(materiais));
  }, [materiais]);

  useEffect(() => {
    localStorage.setItem(data.config_ui.keys.favoritos, JSON.stringify(favoritos));
  }, [favoritos]);

  useEffect(() => {
    localStorage.setItem(data.config_ui.keys.progresso, JSON.stringify(progresso));
  }, [progresso]);

  const handleAddNota = (texto) => {
    setAnotacoes((prev) => {
      const atual = { ...prev };
      if (!atual[diaSelecionado]) atual[diaSelecionado] = [];
      atual[diaSelecionado].push(texto);
      return atual;
    });
  };

  const handleAddMaterial = (material) => {
    setMateriais([...materiais, material]);
  };

  const handleFavorito = (link) => {
    if (!favoritos.find((f) => f.u === link.u)) {
      setFavoritos([...favoritos, link]);
    }
  };

  const handleCheck = (dia, blocoIndex, item) => {
    setProgresso((prev) => {
      const novo = { ...prev };
      if (!novo[dia]) novo[dia] = {};
      if (!novo[dia][blocoIndex]) novo[dia][blocoIndex] = {};
      novo[dia][blocoIndex][item] = !novo[dia][blocoIndex][item];
      return novo;
    });
  };

  const exportarJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ anotacoes, materiais, favoritos, progresso }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-cronograma.json";
    a.click();
  };

  const importarJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const obj = JSON.parse(ev.target.result);
      setAnotacoes(obj.anotacoes || {});
      setMateriais(obj.materiais || []);
      setFavoritos(obj.favoritos || []);
      setProgresso(obj.progresso || {});
    };
    reader.readAsText(file);
  };

  const dia = data.agenda_semanal[diaSelecionado];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar esquerda */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Dias da Semana</h2>
        {Object.keys(data.agenda_semanal).map((d) => (
          <button
            key={d}
            onClick={() => setDiaSelecionado(d)}
            className={`block text-left w-full p-2 rounded mb-2 ${
              diaSelecionado === d ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {data.agenda_semanal[d].nome}
          </button>
        ))}

        <h3 className="text-lg font-semibold mt-6">Favoritos</h3>
        <ul className="text-sm">
          {favoritos.map((f, idx) => (
            <li key={idx}>
              <a href={f.u} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {f.t}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <button
            onClick={exportarJSON}
            className="bg-green-500 text-white px-3 py-1 rounded mr-2"
          >
            Exportar
          </button>
          <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer">
            Importar
            <input
              type="file"
              accept="application/json"
              onChange={importarJSON}
              className="hidden"
            />
          </label>
        </div>
      </aside>

      {/* Área central */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">{dia.nome}</h1>
        {dia.blocos &&
          dia.blocos.map((bloco, idx) => (
            <div key={idx} className="mb-6 bg-white rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">{bloco.foco}</h2>
              <p className="text-sm text-gray-600 mb-2">Duração: {bloco.duracao}</p>
              <ul className="mb-2">
                {bloco.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.u}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {link.t}
                    </a>{" "}
                    <button
                      onClick={() => handleFavorito(link)}
                      className="ml-2 text-xs text-yellow-600"
                    >
                      ★
                    </button>
                  </li>
                ))}
              </ul>
              <div>
                {bloco.checklist &&
                  bloco.checklist.map((item, i) => (
                    <label key={i} className="block">
                      <input
                        type="checkbox"
                        checked={
                          progresso[diaSelecionado]?.[idx]?.[item] || false
                        }
                        onChange={() => handleCheck(diaSelecionado, idx, item)}
                        className="mr-2"
                      />
                      {item}
                    </label>
                  ))}
              </div>
            </div>
          ))}

        {/* Anotações */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Anotações</h2>
          <ul className="mb-2">
            {(anotacoes[diaSelecionado] || []).map((n, i) => (
              <li key={i} className="text-sm">
                {n}
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Adicionar anotação..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                handleAddNota(e.target.value);
                e.target.value = "";
              }
            }}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Materiais */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Materiais</h2>
          <ul className="mb-2">
            {materiais.map((m, i) => (
              <li key={i} className="text-sm">
                <a href={m.url_material} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {m.titulo_material}
                </a>{" "}
                ({m.tags})
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              handleAddMaterial({
                url_material: prompt("URL:"),
                titulo_material: prompt("Título:"),
                tags: prompt("Tags:"),
                observacao: "",
                dia_semana: diaSelecionado,
                disciplina: "",
                lei: "",
              })
            }
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Adicionar Material
          </button>
        </div>
      </main>

      {/* Sidebar direita */}
      <aside className="w-72 bg-white shadow-md p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">Estratégia de Estudo</h2>
        <ul className="text-sm mb-4">
          {data.funcoes_estudo.sugestao_tecnica.map((s, i) => (
            <li key={i}>✔ {s}</li>
          ))}
        </ul>
        <h3 className="font-semibold">Métricas</h3>
        <ul className="text-sm mb-4">
          {data.funcoes_estudo.metrica_de_progresso.map((m, i) => (
            <li key={i}>📊 {m}</li>
          ))}
        </ul>
        <h3 className="font-semibold">Heurística FCC</h3>
        <ul className="text-sm mb-4">
          {data.funcoes_estudo.heuristica_FCC.map((h, i) => (
            <li key={i}>🎯 {h}</li>
          ))}
        </ul>

        <h3 className="font-semibold">Prioridades ({diaSelecionado})</h3>
        <ul className="text-sm mb-4">
          {data.prioridades_por_disciplina[dia.nome.split(" ")[0]]?.map(
            (p, i) => (
              <li key={i}>🔥 {p}</li>
            )
          )}
        </ul>

        <h3 className="font-semibold">Observações Globais</h3>
        <ul className="text-sm mb-4">
          {data.meta.observacoes_globais.map((o, i) => (
            <li key={i}>📝 {o}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
