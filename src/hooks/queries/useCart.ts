"use client";

import { useQuery } from "@tanstack/react-query";
import { ensureAccessToken } from "@/api/authApi";
import { getCart } from "@/api/cartApi";
import { queryKeys } from "@/constants/queryKeys";

export const useCart = () =>
  useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      await ensureAccessToken();
      return getCart();
    },
  });