export default function BaseBody({ title, desc, link, tech }) {
  return (
    <article class="p-4 border-2 rounded-md transition hover:scale-105">
      <div class="mb-4">
        <h3 class="text-orange-400">
          <a class="title-link cursor-pointer" href={link}>
            {title}
          </a>
        </h3>
        <p class="text-sm">{desc}</p>
      </div>
      <div class="text-sm">{tech}</div>
    </article>
  );
}
