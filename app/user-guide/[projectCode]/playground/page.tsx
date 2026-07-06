import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { ExternalLink, Terminal, Download } from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { cookieName, normalizeProjectCode, verifyProjectToken } from '@/lib/auth'
import { getProject } from '@/lib/guide'

const PLAYGROUND_URL = 'https://postwoman.jits.com.vn:5555/'

export default async function PlaygroundPage({
    params
}: {
    params: Promise<{ projectCode: string }>
}) {
    const { projectCode } = await params
    const normalized = normalizeProjectCode(projectCode)

    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName(normalized))?.value

    const PLAYGROUND_URL = 'https://postwoman.jits.com.vn:5555/'
    const POSTWOMAN_DOWNLOAD_URL =
        'https://github.com/hoppscotch/releases/releases/latest/download/Hoppscotch_win_x64.msi'

    if (!verifyProjectToken(normalized, token)) {
        redirect(`/user-guide/${normalized}`)
    }

    let project

    try {
        project = await getProject(normalized)
    } catch {
        notFound()
    }

    return (
        <main className="page">
            <div className="container playground-container">
                <Breadcrumbs
                    items={[
                        { label: 'User Guide', href: '/user-guide' },
                        {
                            label: project.projectName,
                            href: `/user-guide/${normalized}/home`
                        },
                        { label: 'Playground' }
                    ]}
                />

                <section className="playground-header">
                    <div>
                        <p className="eyebrow">
                            <Terminal size={16} />
                            API PLAYGROUND
                        </p>
                        <h1>API Playground</h1>
                        <p className="lead">
                            Sử dụng Postwoman để gọi thử API trực tiếp.
                        </p>
                    </div>

                    <div className="playground-actions">
                        <a
                            href={POSTWOMAN_DOWNLOAD_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="button-secondary"
                        >
                            <Download size={18} />
                            Download Postwoman
                        </a>

                        <a
                            href={PLAYGROUND_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="button-secondary"
                        >
                            <ExternalLink size={18} />
                            Mở tab mới
                        </a>
                    </div>
                </section>

                <section className="playground-frame-shell">
                    <iframe
                        src={PLAYGROUND_URL}
                        title="CMI API Playground"
                        className="playground-frame"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-clipboard-read allow-clipboard-write"
                    />
                </section>
            </div>
        </main>
    )
}