import { useCallback, useState, useEffect } from "react";
import { Employee } from "../utils/types";
import { useCustomFetch } from "./useCustomFetch";
import { EmployeeResult } from "./types";

export function useEmployees(): EmployeeResult {
  const { fetchWithCache } = useCustomFetch();
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  // Introduce a separate loading state for employees to manage its loading status independently
  const [isLoading, setIsLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true); // Set the loading state to true when starting to fetch employee data
    const employeesData = await fetchWithCache<Employee[]>("employees");
    setEmployees(employeesData);
    setIsLoading(false); // Reset the loading state to false after fetching employee data
  }, [fetchWithCache]);

  const invalidateData = useCallback(() => {
    setEmployees(null); // Function to invalidate or reset employee data
  }, []);

  // Use useEffect to fetch employee data when the component mounts or invalidateData is called
  // This ensures that employee data is fetched once and only refetched when explicitly invalidated
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data: employees, loading: isLoading, fetchAll, invalidateData };
}
