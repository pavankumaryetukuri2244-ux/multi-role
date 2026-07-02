import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { Column, DataTableProps } from './DataTable.types';

interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

function DataTable<T extends object>({
  columns,
  rows,
  loading = false,
  keyField,
  totalCount,
  page = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSort,
  emptyStateNode,
  stickyHeader = false,
}: DataTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sortState, setSortState] = useState<SortState | null>(null);

  const handleSort = (columnId: string) => {
    const newDirection: 'asc' | 'desc' =
      sortState?.field === columnId && sortState.direction === 'asc' ? 'desc' : 'asc';
    setSortState({ field: columnId, direction: newDirection });
    onSort?.(columnId, newDirection);
  };

  const getCellValue = (row: T, col: Column<T>): unknown => {
    return row[col.id as keyof T];
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    if (isMobile) {
      return (
        <Stack spacing={2}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} variant="outlined">
              <CardContent>
                {columns.map((_col, j) => (
                  <Box key={j} sx={{ mb: 1 }}>
                    <Skeleton variant="text" width="30%" height={14} />
                    <Skeleton variant="text" width="70%" height={20} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          ))}
        </Stack>
      );
    }

    return (
      <Paper elevation={0} variant="outlined">
        <TableContainer>
          <Table stickyHeader={stickyHeader}>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={String(col.id)}
                    align={col.align ?? 'left'}
                    style={{ minWidth: col.minWidth }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((col) => (
                    <TableCell key={String(col.id)}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!loading && rows.length === 0) {
    return (
      <Paper elevation={0} variant="outlined">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            p: 4,
          }}
        >
          {emptyStateNode ?? (
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          )}
        </Box>
      </Paper>
    );
  }

  // ── Mobile card list ───────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {rows.map((row, rowIdx) => {
          const keyVal = String(row[keyField] ?? rowIdx);
          return (
            <Card key={keyVal} variant="outlined">
              <CardContent>
                {columns.map((col) => {
                  const raw = getCellValue(row, col);
                  const displayed = col.render ? col.render(raw, row) : String(raw ?? '');
                  return (
                    <Box
                      key={String(col.id)}
                      sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {col.label}
                      </Typography>
                      <Typography variant="body2" align="right" sx={{ ml: 1 }}>
                        {displayed}
                      </Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
        {totalCount !== undefined && onPageChange && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={(_e, newPage) => onPageChange(newPage)}
            onRowsPerPageChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
          />
        )}
      </Stack>
    );
  }

  // ── Desktop table ──────────────────────────────────────────────────────────
  return (
    <Paper elevation={0} variant="outlined">
      <TableContainer>
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.id)}
                  align={col.align ?? 'left'}
                  style={{ minWidth: col.minWidth }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortState?.field === String(col.id)}
                      direction={
                        sortState?.field === String(col.id)
                          ? sortState.direction
                          : 'asc'
                      }
                      onClick={() => handleSort(String(col.id))}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIdx) => {
              const keyVal = String(row[keyField] ?? rowIdx);
              return (
                <TableRow hover key={keyVal}>
                  {columns.map((col) => {
                    const raw = getCellValue(row, col);
                    const displayed = col.render ? col.render(raw, row) : String(raw ?? '');
                    return (
                      <TableCell key={String(col.id)} align={col.align ?? 'left'}>
                        {displayed}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {totalCount !== undefined && onPageChange && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_e, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
        />
      )}
    </Paper>
  );
}

export default DataTable;
