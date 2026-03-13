import React from 'react';
import { render, screen } from '@testing-library/react';
import CustomComponents, {
  ReccomendationsTitle,
  Reccomendations,
  ContributorTag,
  Contributor,
  ContributorEntity,
  ContributorName,
  H1Contributor,
  Contributors,
  ContributorRole,
  Spotlight,
  SideNote,
  ChapterQuote,
  SmallQuote,
  SmallQuoteAuthor,
  ContributorSpotlight,
  ContributorSpotlightName,
  ContributorSpotlightPosition,
  ContributorSpotlightRole,
  Definition,
  DefinitionDescription,
  TohInsight,
  Box,
  ColumParagraphs,
  ColumParagraph,
  FigureLabel,
  FundamentalPrinciples,
  TableLabel,
  HeadingLabel,
  QuestionAnswerBox,
  QuestionAnswerBoxTitle,
  QuestionAnswerBoxBody,
  FeatureImage,
  ChapterImage,
  Anchor,
} from '@/components/CustomComponents';

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(async () => (key) => key),
}));

jest.mock('@/components/icons/toh', () => ({
  Physical: (props) => <svg data-testid="icon-Physical" {...props} />,
  Psychological: (props) => <svg data-testid="icon-Psychological" {...props} />,
  Social: (props) => <svg data-testid="icon-Social" {...props} />,
  Societal: (props) => <svg data-testid="icon-Societal" {...props} />,
  Informational: (props) => <svg data-testid="icon-Informational" {...props} />,
  Digital: (props) => <svg data-testid="icon-Digital" {...props} />,
  Deprivational: (props) => <svg data-testid="icon-Deprivational" {...props} />,
  Longitudinal: (props) => <svg data-testid="icon-Longitudinal" {...props} />,
}));

describe('CustomComponents primitives', () => {
  it('renders ReccomendationsTitle and Reccomendations', () => {
    render(
      <div>
        <ReccomendationsTitle>Title text</ReccomendationsTitle>
        <Reccomendations>Recommendation text</Reccomendations>
      </div>
    );

    expect(screen.getByLabelText('ReccomendationsTitle')).toHaveTextContent('Title text');
    expect(screen.getByLabelText('Reccomendations')).toHaveTextContent('Recommendation text');
  });

  it('renders ContributorTag with column count', () => {
    const { container } = render(
      <ContributorTag>
        <div>One</div>
        <div>Two</div>
      </ContributorTag>
    );

    expect(container.firstChild).toHaveClass('md:grid-cols-2');
  });

  it('renders Contributor composition elements', () => {
    render(
      <Contributor>
        <ContributorName>Jane Doe</ContributorName>
        <ContributorEntity>IFRC</ContributorEntity>
        <ContributorRole>Lead</ContributorRole>
      </Contributor>
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('IFRC')).toBeInTheDocument();
    expect(screen.getByText('Lead')).toBeInTheDocument();
  });

  it('renders ContributorName and ContributorEntity styling containers', () => {
    const { container } = render(
      <div>
        <ContributorName>Contributor Name</ContributorName>
        <ContributorEntity>Contributor Entity</ContributorEntity>
      </div>
    );

    const nameNode = screen.getByText('Contributor Name');
    const entityNode = screen.getByText('Contributor Entity');

    expect(nameNode).toHaveClass('border-b-2');
    expect(container.querySelector('div div')).toContainElement(entityNode);
  });

  it('renders header-like components', () => {
    render(
      <div>
        <H1Contributor>Header</H1Contributor>
        <Contributors>Group</Contributors>
        <ContributorRole>Role</ContributorRole>
      </div>
    );

    expect(screen.getByLabelText('H1Contributors')).toHaveTextContent('Header');
    expect(screen.getByLabelText('Contributors')).toHaveTextContent('Group');
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('renders layout helpers', () => {
    render(
      <div>
        <Spotlight>Spotlight content</Spotlight>
        <SideNote>Side note</SideNote>
        <ChapterQuote>Chapter quote</ChapterQuote>
      </div>
    );

    expect(screen.getByText('Spotlight content')).toBeInTheDocument();
    expect(screen.getByText('Side note').closest('aside')).toBeInTheDocument();
    expect(screen.getByText('Chapter quote')).toBeInTheDocument();
  });

  it('renders quote components', () => {
    render(
      <div>
        <SmallQuote>Quote text</SmallQuote>
        <SmallQuoteAuthor>Author</SmallQuoteAuthor>
      </div>
    );

    expect(screen.getByText('Quote text').closest('blockquote')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
  });

  it('renders contributor spotlight components', () => {
    render(
      <ContributorSpotlight>
        <ContributorSpotlightName>Spot Name</ContributorSpotlightName>
        <ContributorSpotlightPosition>Position</ContributorSpotlightPosition>
        <ContributorSpotlightRole>Role</ContributorSpotlightRole>
      </ContributorSpotlight>
    );

    expect(screen.getByText('Spot Name')).toBeInTheDocument();
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('renders definition components', () => {
    render(
      <div>
        <Definition>Definition</Definition>
        <DefinitionDescription>Description</DefinitionDescription>
      </div>
    );

    expect(screen.getByText('Definition')).toBeInTheDocument();
    expect(screen.getByText('Description').closest('aside')).toBeInTheDocument();
  });

  it('renders column paragraph layout', () => {
    const { container } = render(
      <ColumParagraphs count={2}>
        <ColumParagraph>First column</ColumParagraph>
        <ColumParagraph>Second column</ColumParagraph>
      </ColumParagraphs>
    );

    expect(container.firstChild).toHaveStyle({ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' });
    expect(screen.getByText('First column')).toBeInTheDocument();
    expect(screen.getByText('Second column')).toBeInTheDocument();
  });

  it('renders Anchor with meta and children', () => {
    render(<Anchor meta="1.1">Anchor heading</Anchor>);

    expect(screen.getByText('Anchor heading')).toBeInTheDocument();
    expect(screen.getByText('1.1')).toBeInTheDocument();
  });

  it('renders FeatureImage with description and IFRC credit', () => {
    render(
      <FeatureImage src="/test-image.jpg" description="Test caption" width={400} height={300} />
    );

    expect(screen.getByAltText('/test-image.jpg')).toBeInTheDocument();
    expect(screen.getByText('Test caption')).toBeInTheDocument();
    expect(screen.getByText('@IFRC')).toBeInTheDocument();
  });

  it('renders FeatureImage without description', () => {
    render(<FeatureImage src="/img.png" width={400} height={300} />);

    expect(screen.getByAltText('/img.png')).toBeInTheDocument();
    expect(screen.queryByText('@IFRC')).not.toBeInTheDocument();
  });

  it('renders QuestionAnswerBox composition', () => {
    render(
      <QuestionAnswerBox>
        <QuestionAnswerBoxTitle>Why does this matter?</QuestionAnswerBoxTitle>
        <QuestionAnswerBoxBody>
          <p>Because it does.</p>
        </QuestionAnswerBoxBody>
      </QuestionAnswerBox>
    );

    expect(screen.getByText('Why does this matter?')).toBeInTheDocument();
    expect(screen.getByText('Because it does.')).toBeInTheDocument();
  });

  it('renders HeadingLabel with index', () => {
    render(<HeadingLabel index="2.1" />);

    expect(screen.getByText('2.1')).toBeInTheDocument();
  });

  it('renders TableLabel with default label', () => {
    render(<TableLabel index={3} />);

    expect(screen.getByText('Table 3')).toBeInTheDocument();
  });

  it('renders TableLabel with custom label', () => {
    render(<TableLabel index={1} label="Tableau" />);

    expect(screen.getByText('Tableau 1')).toBeInTheDocument();
  });

  it('renders FigureLabel with default label', () => {
    render(<FigureLabel index={5} />);

    expect(screen.getByText('Fig 5')).toBeInTheDocument();
  });

  it('renders FigureLabel with custom label', () => {
    render(<FigureLabel index={2} label="Figure" />);

    expect(screen.getByText('Figure 2')).toBeInTheDocument();
  });

  it('renders FundamentalPrinciples', () => {
    render(<FundamentalPrinciples>Humanity</FundamentalPrinciples>);

    expect(screen.getByText('Humanity')).toBeInTheDocument();
  });

  it('renders ChapterImage with title, subtitle and caption', () => {
    render(
      <ChapterImage
        imagePath="/chapter-img.jpg"
        alt="Chapter image"
        width={800}
        height={600}
        imageTitle="Figure Title"
        imageSubtitle="A subtitle"
        caption="Photo credit"
        imageIndex={1}
      />
    );

    expect(screen.getByAltText('Chapter image')).toBeInTheDocument();
    expect(screen.getByText('Figure Title')).toBeInTheDocument();
    expect(screen.getByText('A subtitle')).toBeInTheDocument();
    expect(screen.getByText('Photo credit')).toBeInTheDocument();
    expect(screen.getByText('Fig 1')).toBeInTheDocument();
  });

  it('renders ChapterImage without optional props', () => {
    render(<ChapterImage imagePath="/simple.jpg" alt="Simple" width={400} height={300} />);

    expect(screen.getByAltText('Simple')).toBeInTheDocument();
    expect(screen.queryByRole('figcaption')).not.toBeInTheDocument();
  });
});

describe('CustomComponents async components', () => {
  it('renders TohInsight icons for types', async () => {
    const element = await TohInsight({ types: ['Physical', 'Digital'] });
    render(element);

    expect(screen.getByTestId('icon-Physical')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Digital')).toBeInTheDocument();
  });

  it('renders Box content and anchor', async () => {
    const element = await Box({
      index: 1,
      children: [
        <h2 id="insight-1" key="h2">
          Box Heading
        </h2>,
        <p key="p">Box body</p>,
        <ContributorTag key="tag">
          <div>Contributor Tag</div>
        </ContributorTag>,
      ],
    });

    render(element);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Box Heading',
    });

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('id');
    expect(screen.getByText('Box body')).toBeInTheDocument();
    expect(screen.getByText('Contributor Tag')).toBeInTheDocument();
    expect(document.querySelector('#insight-1')).toBeInTheDocument();
    expect(screen.getByText('title 1')).toBeInTheDocument();
  });
});

describe('CustomComponents default export', () => {
  it('exposes key components', () => {
    expect(CustomComponents.Box).toBe(Box);
    expect(CustomComponents.Definition).toBe(Definition);
    expect(CustomComponents.DefinitionDescription).toBe(DefinitionDescription);
  });
});
