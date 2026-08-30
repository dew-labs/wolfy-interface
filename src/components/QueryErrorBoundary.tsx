import createQueryErrorBoundary from '@/utils/query/createQueryErrorBoundary'
import ErrorComponent from '@/views/Error/ErrorComponent'

const QueryErrorBoundary = createQueryErrorBoundary(ErrorComponent)

export default QueryErrorBoundary
