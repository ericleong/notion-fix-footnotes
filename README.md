# notion-fix-footnotes

Fixes the footnotes of [Notion](https://www.notion.so/) pages created via Markdown import.

*Note that this repository is not intended to be a full project, it definitely will not work on every possible input. Ideally Notion would add this functionality to their import tool.*

## Why?

For example, if the below markdown file is uploaded to Notion:

```markdown
Bourdieu once said analogy is “functioning as a circular mode of 
thought, makes it possible to tour the whole area of art and luxury 
without ever leaving it.”[^1] Does that not make analogy *hyperreal*?

> Useless to ask which is the first term, there is none, it is a
> circular process—that of simulation, that of the hyperreal. The
> hyperreality of communication and of meaning. More real than the real,
> that is how the real is abolished.[^2]

[^1]: Pierre Bourdieu, *Distinction: A Social Critique of the Judgement
    of Taste*, trans. Richard Nice (Cambridge, Massachusetts: Harvard
    University Press, 1984), 53.
[^2]: Jean Baudrillard, *Simulacra and Simulation*, trans. Faria Sheila
    Glaser (Ann Arbor: The University of Michigan Press, 1994), 81.
```

generates this html:

```html
<p>Bourdieu once said analogy is “functioning as a circular mode of thought, makes it possible to tour the whole area of art and luxury without ever leaving it.”<a href="about:blank#fn1">1</a> Does that not make analogy <em>hyperreal</em>?</p>
<blockquote>Useless to ask which is the first term, there is none, it is a circular process—that of simulation, that of the hyperreal. The hyperreality of communication and of meaning. More real than the real, that is how the real is abolished.2</blockquote>
<hr/>
<ol type="1" start="1">
    <li>Pierre Bourdieu, <em>Distinction: A Social Critique of the Judgement of Taste</em>, trans. Richard Nice (Cambridge, Massachusetts: Harvard University Press, 1984), 53.<a href="about:blank#fnref1">↩</a></li>
</ol>
<ol type="1" start="2">
    <li>Jean Baudrillard, <em>Simulacra and Simulation</em>, trans. Faria Sheila Glaser (Ann Arbor: The University of Michigan Press, 1994), 81.<a href="about:blank#fnref2">↩</a></li>
</ol>
```

The link to `about:blank#fn1` doesn't go to the footnote, and the backreference `about:blank#fnref1` doesn't go to the paragraph block. The `2` in the `blockquote` is also not turned into a link.

This integration goes through the integrated pages and replaces the above *useless* links with *page-specific* links so that you can jump between the block that contains the reference number and the footnote.

Note that this integration *does not* fix altered blocks that have been moved to another page! This functionality may be added in a future version.

## How to use

1. Make sure you've [created a Notion integration](https://developers.notion.com/docs/getting-started) and have a secret Notion token.
2. Add your Notion token to a `.env` file at the root of this repository: `echo "NOTION_TOKEN=[your token here]" > .env`.
3. Run `npm install`.
4. Add this integration to the pages where the footnotes need to be fixed.
5. Run `npm start` to run the script.
6. Remove this integration from the pages that have been fixed.

## NPM Scripts

| Script              | Action                                                                                                                                                                          |
| - | - |
| `npm start`         | Run `index.ts`.                                                                                                                                                                 |
| `npm run typecheck` | Type check using the TypeScript compiler.                                                                                                                                       |
| `npm run format`    | Format using Prettier (also recommended: the [Prettier VS Code extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) if you're using VS code.) |
| `npm run build`     | Build JavaScript into the `dist/` directory. You normally shouldn't need this if you're using `npm start`.                                                                      |
