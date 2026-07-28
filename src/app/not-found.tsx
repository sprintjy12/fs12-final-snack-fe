import Image from "next/image";

const NotFoundPage = () => (
  <main className="fixed inset-0 z-50 flex items-center justify-center bg-surface-muted px-6">
    <section
      aria-labelledby="not-found-title"
      className="flex flex-col items-center gap-6 text-center xl:gap-10"
    >
      <picture>
        <source
          media="(min-width: 1280px)"
          srcSet="/images/common/empty-purchase-md.svg"
        />
        <Image
          src="/images/common/empty-purchase-sm.svg"
          alt=""
          width={180}
          height={130}
          priority
          className="block h-auto w-[180px] xl:w-[280px]"
        />
      </picture>
      <div className="text-sm leading-6 font-medium text-snack-gray-400 xl:text-xl xl:leading-8">
        <h1 id="not-found-title" className="font-medium">
          페이지를 찾을 수 없어요
        </h1>
        <p>
          주소가 잘못되었거나 페이지가 이동되었을 수 있어요.
        </p>
      </div>
    </section>
  </main>
);

export default NotFoundPage;
