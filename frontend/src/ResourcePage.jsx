import { useState } from 'react'
import { api } from './api'
import { Button, Drawer, Empty, EntityForm, Notice, PageHeader, useList } from './ui'

/** A table plus an "add" drawer. Used for cities, employers, job positions and candidates. */
export default function ResourcePage({ title, intro, listPath, addPath, fields, columns, addTitle, submitLabel, emptyText }) {
  const { items, loading, error, reload } = useList(listPath)
  const [open, setOpen] = useState(false)
  const [flash, setFlash] = useState('')

  return (
    <>
      <PageHeader title={title} intro={intro} action={<Button onClick={() => { setFlash(''); setOpen(true) }}>{submitLabel}</Button>} />
      <div className="space-y-4">
        {flash && <Notice ok>{flash}</Notice>}
        {error && <Notice ok={false}>{error}</Notice>}
        {loading ? <p className="text-sm text-[#627085]">Loading…</p>
          : items.length === 0 && !error ? <Empty>{emptyText}</Empty>
          : items.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-[#DDE3EA] bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#DDE3EA] bg-[#F8FAFB] text-[#627085]">
                  <tr>{columns.map((c) => <th key={c.label} className="px-4 py-3 font-medium">{c.label}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((row, i) => (
                    <tr key={row.id ?? i} className="border-b border-[#EDF0F4] last:border-0 hover:bg-[#F8FAFB]">
                      {columns.map((c) => (
                        <td key={c.label} className="px-4 py-3 text-[#17233A]">
                          {c.render ? c.render(row) : row[c.keys[0]] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        {!loading && items.length > 0 && <p className="text-sm text-[#627085]">{items.length} total</p>}
      </div>
      <Drawer open={open} title={addTitle} onClose={() => setOpen(false)}>
        <EntityForm
          fields={fields}
          submitLabel={submitLabel}
          onSubmit={async (payload) => {
            const r = await api.post(addPath, payload)
            setFlash(r.message || 'Saved.')
            setOpen(false)
            reload()
          }}
        />
      </Drawer>
    </>
  )
}
