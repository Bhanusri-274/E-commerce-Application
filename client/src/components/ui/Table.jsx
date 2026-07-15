const Table = ({ columns, data, rowKey }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-[#64748B]">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-3 font-medium ${col.align === "right" ? "text-right" : ""}`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-10 text-center text-[#64748B]">
              No data found
            </td>
          </tr>
        ) : (
          data.map((row) => (
            <tr key={row[rowKey]} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC]">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 ${col.align === "right" ? "text-right" : "text-[#0F172A]"}`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default Table;
