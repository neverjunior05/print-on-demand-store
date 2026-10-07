import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return <div className="not-found-page"><span className="not-found-stamp">404<br />OOPS ✳</span><span className="eyebrow">THIS PAGE IS A LITTLE LOST</span><h1>We couldn't<br /><span>find that thing.</span></h1><p>Maybe it was a limited drop. Maybe the URL got a little mixed up. Either way, there's plenty more good stuff.</p><div><Link className="button button-primary" href="/shop">Go find something good <Icon name="arrow" size={17} /></Link><Link href="/" className="text-link">Back to the home page</Link></div></div>;
}
