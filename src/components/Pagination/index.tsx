

const PaginationConfig = {
  showQuickJumper: true,
  showSizeChanger: true,
  defaultPageSize: 10,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total) => (`Total ${total}`)
}

export default PaginationConfig
