import { useState } from 'react'
import { api } from './api'
import { Button, Drawer, Empty, EntityForm, Notice, PageHeader, SkeletonList, useList } from './ui'

export default function ResourcePage({ title, intro, listPath, addPath, fields, columns, addTitle, submitLabel, emptyText }) {
  const { items, loading, error, reload } = useList(listPath)
  const [open, setOpen] = useState(false)
  const [flash, setFlash] = useState('')

  return (
    <>
      <PageHeader
        badge="Directory Management"
        title={title}
        intro={intro}
        action={<Button onClick={() => { setFlash(''); setOpen(true) }}>+ {submitLabel}</Button>}
      />
      <div className="space-y-4">
        {flash && <Notice ok>{flash}</Notice>}
        {error && <Notice ok={false}>{error}</Notice>}
        {loading ? (
          <SkeletonList count={3} />
        ) : items.length === 0 && !error ? (
          <Empty>{emptyText}</Empty>
        ) : (
          items.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{title} Directory</span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {items.length} total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200/80 bg-slate-50/40 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    <tr>
                      {columns.map((c) => (
                        <th key={c.label} className="px-5 py-3.5">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((row, i) => (
                      <tr key={row.id ?? i} className="transition hover:bg-slate-50/80">
                        {columns.map((c) => (
                          <td key={c.label} className="px-5 py-3.5 font-medium text-slate-800">
                            {c.render ? c.render(row) : row[c.keys[0]] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
      <Drawer open={open} title={addTitle} onClose={() => setOpen(false)}>
        <EntityForm
          fields={fields}
          submitLabel={submitLabel}
          onSubmit={async (payload) => {
            const r = await api.post(addPath, payload)
            setFlash(r.message || 'Saved successfully.')
            setOpen(false)
            reload()
          }}
        />
      </Drawer>
    </>
  )
}