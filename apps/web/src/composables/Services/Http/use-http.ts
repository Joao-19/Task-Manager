import { useCallback, useState } from "react";
import type { AxiosResponse } from "axios";

export interface ApiError {
  message: string;
  response?: {
    status: number;
    data: any;
  };
}

export interface ListResult<T> {
  page: number;
  total: number;
  rows: T[];
  totalPages: number;
  pageSize: number;
}

/**
 * Hook base para requisições HTTP
 * Gerencia estado de loading, erro e dados.
 *
 * @param apiFunction Função que realiza a chamada à API
 * @param defaultValue Valor inicial para os dados
 */
export function useBaseHttp<Response, Form, DefaultValue>(
  apiFunction: (form: Form) => Promise<AxiosResponse<Response> | Response>,
  defaultValue: DefaultValue
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<Response | DefaultValue>(defaultValue);

  const request = useCallback(
    async (form: Form): Promise<Response> => {
      setLoading(true);
      setError(null);
      try {
        // A autenticação (Bearer token) é injetada automaticamente pelo interceptor em globalApi (@/lib/api)
        // O refresh token também é tratado automaticamente lá.

        const res = await apiFunction(form);

        // Verifica se é uma resposta do Axios (tem 'data' e 'headers') ou direto o dado
        if (
          res &&
          typeof res === "object" &&
          "data" in res &&
          "headers" in res
        ) {
          const axiosRes = res as AxiosResponse<Response>;
          // Nota: O token updates são feitos via interceptor ou localStorage direto no login,
          // aqui focamos apenas nos dados.
          setData(axiosRes.data);
          return axiosRes.data;
        }

        // Caso a função api retorne o dado direto
        const responseData = res as Response;
        setData(responseData);
        return responseData;
      } catch (e: any) {
        // O tratamento de erro 401/Refresh é feito no interceptor do axios em @/lib/api.
        // Se chegar aqui, é porque o refresh falhou ou é outro erro.
        const apiError: ApiError = {
          message: e.message || "Erro desconhecido",
          response: e.response,
        };
        setError(apiError);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    request,
    loading,
    error,
    data,
  };
}

/**
 * Hook para requisições que retornam um único objeto (ou nulo/vazio)
 */
export function useHttp<Response, Form>(
  apiFunction: (form: Form) => Promise<AxiosResponse<Response> | Response>
) {
  return useBaseHttp<Response, Form, Response | null>(apiFunction, null);
}

/**
 * Hook para requisições que retornam uma lista simples (array)
 */
export function useHttpList<Response, Form>(
  apiFunction: (form: Form) => Promise<AxiosResponse<Response> | Response>
) {
  return useBaseHttp<Response, Form, Response[]>(apiFunction, []);
}

/**
 * Hook para requisições paginadas
 */
export function useHttpPaginate<Response, Form>(
  apiFunction: (
    form: Form
  ) => Promise<AxiosResponse<ListResult<Response>> | ListResult<Response>>
) {
  return useBaseHttp<ListResult<Response>, Form, ListResult<Response>>(
    apiFunction,
    {
      page: 0,
      total: 0,
      rows: [],
      totalPages: 0,
      pageSize: 0,
    }
  );
}
