interface Section {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  title: string;
  content: string;
}

interface Props {
  initialSections?: Partial<Record<1 | 2 | 3 | 4, { title: string; content: string }>>;
}

const sectionLabels: Record<number, string> = {
  1: 'Sezione 1',
  2: 'Sezione 2',
  3: 'Sezione 3',
  4: 'Sezione 4',
};

export function ContentSections({ initialSections = {} }: Props) {
  const sections = [1, 2, 3, 4] as const;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Sezioni di Contenuto</h3>

      <div className="space-y-6">
        {sections.map((num) => (
          <div key={num} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {sectionLabels[num]}
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Titolo Sezione {num}
                </label>
                <input
                  type="text"
                  name={`title_section_${num}`}
                  defaultValue={initialSections[num]?.title || ''}
                  placeholder={`Titolo ${sectionLabels[num]}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Contenuto HTML Sezione {num}
                </label>
                <textarea
                  name={`body_HTML_section_${num}`}
                  defaultValue={initialSections[num]?.content || ''}
                  rows={4}
                  placeholder={`<p>Contenuto HTML per ${sectionLabels[num]}</p>`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] font-mono text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
