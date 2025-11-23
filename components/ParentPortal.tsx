import React from 'react';
import { PixelCard } from './PixelUI';
import { BookOpen, Brain, Clock, ShieldCheck } from 'lucide-react';

export const ParentPortal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button onClick={onBack} className="mb-6 text-white hover:underline text-xl uppercase">← VOLTAR PARA O MUNDO</button>
      
      <div className="bg-stone-900 border-4 border-stone-600 p-8 text-white pixel-shadow">
        <h1 className="text-4xl text-yellow-400 mb-6 text-center border-b-2 border-stone-700 pb-4 uppercase">
          GUIA PARA PAIS E PROFESSORES
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl text-green-400 mb-4 flex items-center gap-2 uppercase">
              <Brain className="w-6 h-6" /> O QUE É SCIENCE OF READING?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4 text-lg">
              Science of Reading (Ciência da Leitura) não é um "método" único, mas sim um corpo vasto de pesquisas de psicologia cognitiva e neurociência que descreve como o cérebro humano aprende a ler.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg">
              Nosso app segue a <strong>Visão Simples da Leitura</strong>:
              <br />
              <span className="text-yellow-200 block mt-2 text-center bg-stone-800 p-2 border border-stone-600 uppercase">
                DECODIFICAÇÃO × COMPREENSÃO DE LINGUAGEM = COMPREENSÃO DE LEITURA
              </span>
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-blue-400 mb-4 flex items-center gap-2 uppercase">
              <ShieldCheck className="w-6 h-6" /> MÉTODOS QUE USAMOS
            </h2>
            <ul className="space-y-3 text-gray-300 text-lg">
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span><strong>Consciência Fonêmica:</strong> Entender que palavras são feitas de sons individuais.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span><strong>Fônica Sistemática:</strong> Ensinar explicitamente a relação letra-som.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span><strong>Ortografia:</strong> Mapeamento da fala para a escrita.</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-8 bg-stone-800 p-6 border-l-4 border-yellow-500">
            <h3 className="text-xl text-yellow-400 mb-2 font-bold flex items-center gap-2 uppercase">
                <Clock className="w-5 h-5"/> DICA DE OURO: PRÁTICA ESPAÇADA
            </h3>
            <p className="text-gray-300">
                Não force longas sessões! O cérebro aprende melhor com repetições curtas e frequentes. 
                <strong>10 a 15 minutos por dia</strong> no "Crafting Readers" é mais eficaz que 1 hora uma vez por semana.
            </p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
            <PixelCard title="O QUE EVITAR" color="bg-red-900" className="border-red-700">
                <ul className="text-gray-200 space-y-2 uppercase text-sm">
                    <li>❌ TENTAR ADIVINHAR A PALAVRA PELO DESENHO.</li>
                    <li>❌ TENTAR ADIVINHAR PELA PRIMEIRA LETRA APENAS.</li>
                    <li>❌ DECORAR PALAVRAS VISUALMENTE (SEM DECODIFICAR).</li>
                </ul>
            </PixelCard>
            
            <PixelCard title="COMO AJUDAR" color="bg-green-900" className="border-green-700">
                <ul className="text-gray-200 space-y-2 uppercase text-sm">
                    <li>✅ PEÇA PARA A CRIANÇA "SONDAR" A PALAVRA (FALAR CADA SOM).</li>
                    <li>✅ LEIA PARA ELA EM VOZ ALTA TODOS OS DIAS.</li>
                    <li>✅ COMEMORE PEQUENOS ACERTOS COM ENTUSIASMO!</li>
                </ul>
            </PixelCard>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">Referência estrutural baseada nos princípios de Orton-Gillingham e National Reading Panel.</p>
        </div>
      </div>
    </div>
  );
};