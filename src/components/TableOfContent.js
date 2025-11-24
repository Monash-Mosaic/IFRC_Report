export default function TableOfContent({ chapterTableOfContents, title }) {
  return (
    <>
      <div className="text-2xl text-black font-extrabold mb-2">{title}</div>
      <div className="border-l-3 border-l-[#ee2435]">
        <ul className="pl-2 m-0">
          {chapterTableOfContents.map(({ depth, id, value }) => {
            return (
              <li key={`${id}`} className="mb-2">
                <a href={`#${id}`}>
                  <div className="text-[#495057] font-bold hover:text-black hover:underline">
                    {value}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
