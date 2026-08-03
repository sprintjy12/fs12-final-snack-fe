/**
 * 서버 데이터 캐시를 같은 규칙으로 찾기 위한 Query Key 모음입니다.
 * 새 도메인은 같은 형태로 all, list, detail 키를 이 객체에 추가합니다.
 */
export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    list: () => ["posts", "list"] as const,
    detail: (postId: number) => ["posts", "detail", postId] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params: object) => ["products", "list", params] as const,
    detail: (id: number) => ["products", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
};
