import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch();
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<Transaction[]> | null>(null);

  const fetchAll = useCallback(async () => {
    // Determine the next page to fetch. If no data has been fetched yet, start from page 0.
    const nextPage = paginatedTransactions?.nextPage ?? 0;

    // Only attempt to fetch more data if there is a 'nextPage' value.
    if (nextPage === 0 || nextPage) {
      const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
          "paginatedTransactions",
          { page: nextPage }
      );

      setPaginatedTransactions((previousResponse) => {
        // If the response is null, which means no new data was fetched, we just return the previous state.
        if (response === null) {
          return previousResponse;
        }

        // If there was no previous data, or we're fetching the first page, we use the response as is.
        if (previousResponse === null || nextPage === 0) {
          return response;
        }

        // Merge the new transactions with the existing ones.
        return {
          ...response, // Use the new response's structure.
          data: [...previousResponse.data, ...response.data], // Combine the old data with the new data.
          nextPage: response.nextPage // Update to the new nextPage.
        };
      });
    }
  }, [fetchWithCache, paginatedTransactions]);

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null); // Reset the pagination data if we need to start over.
  }, []);

  return { data: paginatedTransactions, loading, fetchAll, invalidateData };
}

