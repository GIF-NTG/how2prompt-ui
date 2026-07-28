import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFoundState() {
  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-4 px-5 pb-16 pt-24 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <span className="font-mono text-[3rem] font-bold text-[#DBDFD3] dark:text-[#2C3130]">
        404
      </span>
      <h2 className="m-0 text-[1.2rem] font-bold">Không tìm thấy mẫu</h2>
      <p className="m-0 text-[0.88rem] text-[#5B5F58] dark:text-[#A2A79C]">
        Mẫu bạn tìm không tồn tại hoặc đã bị xóa.
      </p>
      <Link
        to="/"
        viewTransition
        className="mt-2 inline-flex items-center gap-1 text-[0.88rem] text-[#3652E0] underline underline-offset-2 hover:text-[#2a3fb0] dark:text-[#8493FF] dark:hover:text-[#a3b0ff]"
      >
        <ArrowLeft size={14} />
        Quay lại thư viện
      </Link>
    </main>
  )
}
