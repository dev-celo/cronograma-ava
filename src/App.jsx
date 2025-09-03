/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-expect-error → Ignora a próxima linha e obriga você a ter certeza que queria ignorar

import React, { useState, useEffect } from "react";
import cronogramaJson from "./cronograma.json";
import {
  Book,
  CheckCircle,
  Star,
  Notebook,
  Target,
  FileText,
  Upload,
  Download,
} from "lucide-react";

export default function CronogramaApp() {
  const [data, setData] = useState(cronogramaJson);
  const [diaSelecionado, setDiaSelecionado] = useState("segunda");
  const [anotacoes, setAnotacoes] = useState({});
  const [materiais, setMateriais] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [progresso, setProgresso] = useState({});

  // 🔗 Centralização de links globais
  const LINKS = {
    siteGranCursos: "https://www.grancursosonline.com.br",
    videoAulaPenal: "https://youtube.com/playlist?list=penal",
    videoAulaProcPenal: "https://youtube.com/playlist?list=proc-penal",
    // adicione aqui os outros links que aparecem em `blocos`
  };

  // Carregar do localStorage
  useEffect(() => {
    const get = (key, fallback) =>
      JSON.parse(localStorage.getItem(key)) || fallback;

    setAnotacoes(get(data.config_ui.keys.anotacoes, {}));
    setMateriais(get(data.config_ui.keys.materiais, []));
    setFavoritos(get(data.config_ui.keys.favoritos, []));
    setProgresso(get(data.config_ui.keys.progresso, {}));
  }, [data.config_ui.keys]);

  // Salvar no localStorage de forma DRY
  useEffect(() => {
    localStorage.setItem(
      data.config_ui.keys.anotacoes,
      JSON.stringify(anotacoes)
    );
  }, [anotacoes, data.config_ui.keys.anotacoes]);

  useEffect(() => {
    localStorage.setItem(
      data.config_ui.keys.materiais,
      JSON.stringify(materiais)
    );
  }, [materiais, data.config_ui.keys.materiais]);

  useEffect(() => {
    localStorage.setItem(
      data.config_ui.keys.favoritos,
      JSON.stringify(favoritos)
    );
  }, [favoritos, data.config_ui.keys.favoritos]);

  useEffect(() => {
    localStorage.setItem(
      data.config_ui.keys.progresso,
      JSON.stringify(progresso)
    );
  }, [progresso, data.config_ui.keys.progresso]);

  // 📌 Manipuladores
  const handleAddNota = (texto) => {
    setAnotacoes((prev) => {
      const atual = { ...prev };
      if (!atual[diaSelecionado]) atual[diaSelecionado] = [];
      atual[diaSelecionado].push(texto);
      return atual;
    });
  };

  const handleAddMaterial = (material) =>
    setMateriais((prev) => [...prev, material]);

  const handleFavorito = (link) => {
    if (!favoritos.find((f) => f.u === link.u))
      setFavoritos((prev) => [...prev, link]);
  };

  const handleCheck = (dia, blocoIndex, item) => {
    setProgresso((prev) => {
      const novo = structuredClone(prev);
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
      try {
        const obj = JSON.parse(ev.target.result);
        setAnotacoes(obj.anotacoes || {});
        setMateriais(obj.materiais || []);
        setFavoritos(obj.favoritos || []);
        setProgresso(obj.progresso || {});
      } catch (err) {
        alert("Arquivo inválido!");
      }
    };
    reader.readAsText(file);
  };

  const dia = data.agenda_semanal[diaSelecionado];

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      {/* Sidebar esquerda */}
      <aside className="w-64 bg-white shadow-xl p-4 flex flex-col rounded-r-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700">
          <Book size={20} /> Dias da Semana
        </h2>
        {Object.keys(data.agenda_semanal).map((d) => (
          <button
            key={d}
            onClick={() => setDiaSelecionado(d)}
            className={`block text-left w-full p-3 rounded-xl mb-2 transition ${
              diaSelecionado === d
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 hover:bg-blue-200"
            }`}
          >
            {data.agenda_semanal[d].dia}
          </button>
        ))}

        <h3 className="text-lg font-semibold mt-6 flex items-center gap-2 text-yellow-600">
          <Star size={18} /> Favoritos
        </h3>
        <ul className="text-sm">
          {favoritos.length === 0 && (
            <li className="text-gray-400 italic">Nenhum favorito ainda</li>
          )}
          {favoritos.map((f, idx) => (
            <li key={idx} className="mt-1">
              <a
                href={f.u}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {f.t}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex gap-2">
          <button
            onClick={exportarJSON}
            className="bg-green-500 text-white flex items-center gap-1 px-3 py-2 rounded-lg shadow hover:bg-green-600 transition"
          >
            <Download size={16} /> Exportar
          </button>
          <label className="bg-blue-500 text-white flex items-center gap-1 px-3 py-2 rounded-lg shadow hover:bg-blue-600 transition cursor-pointer">
            <Upload size={16} /> Importar
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
        <h1 className="text-3xl font-extrabold mb-6 text-blue-700">
          {dia.nome}
        </h1>
        {dia.blocos?.map((bloco, idx) => (
          <div
            key={idx}
            className="mb-6 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
              <FileText size={18} /> {bloco.foco}
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              Duração: {bloco.duracao}
            </p>
            <ul className="mb-2 space-y-1">
              {bloco.links.map((link, i) => (
                <li key={i} className="flex items-center gap-2">
                  <a
                    href={LINKS[link.key] || link.u}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {link.t}
                  </a>
                  <button
                    onClick={() => handleFavorito(link)}
                    className="ml-2 text-xs text-yellow-600 hover:text-yellow-800"
                  >
                    ★
                  </button>
                </li>
              ))}
            </ul>
            {bloco.checklist?.map((item, i) => (
              <label key={i} className="block text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={progresso[diaSelecionado]?.[idx]?.[item] || false}
                  onChange={() => handleCheck(diaSelecionado, idx, item)}
                  className="mr-2 accent-green-500"
                />
                {item}
              </label>
            ))}
          </div>
        ))}

        {/* Anotações */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
            <Notebook size={18} /> Anotações
          </h2>
          <ul className="mb-2 space-y-1">
            {(anotacoes[diaSelecionado] || []).map((n, i) => (
              <li key={i} className="text-sm bg-gray-50 p-2 rounded">
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
            className="border p-2 w-full rounded-lg focus:ring focus:ring-blue-300"
          />
        </div>
      </main>

      {/* Sidebar direita */}
      <aside className="w-80 bg-white shadow-xl p-6 rounded-l-2xl overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700">
          <Target size={20} /> Estratégia de Estudo
        </h2>
        <ul className="text-sm mb-4 space-y-1">
          {data.funcoes_estudo.sugestao_tecnica.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" /> {s}
            </li>
          ))}
        </ul>

        <h3 className="font-semibold text-gray-700 mt-4">📊 Métricas</h3>
        <ul className="text-sm mb-4 space-y-1">
          {data.funcoes_estudo.metrica_de_progresso.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>

        <h3 className="font-semibold text-gray-700 mt-4">🎯 Heurística FCC</h3>
        <ul className="text-sm mb-4 space-y-1">
          {data.funcoes_estudo.heuristica_FCC.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>

        <h3 className="font-semibold text-gray-700 mt-4">
          🔥 Prioridades ({diaSelecionado})
        </h3>
        <ul className="text-sm mb-4 space-y-1">
          {data.prioridades_por_disciplina[dia.nome.split(" ")[0]]?.map(
            (p, i) => (
              <li key={i}>{p}</li>
            )
          )}
        </ul>

        <h3 className="font-semibold text-gray-700 mt-4">
          📝 Observações Globais
        </h3>
        <ul className="text-sm mb-4 space-y-1">
          {data.meta.observacoes_globais.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
