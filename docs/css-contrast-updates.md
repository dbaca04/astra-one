# CSS Contrast Improvements Documentation

## Overview

This document outlines the changes made to improve contrast ratios across the Astra One website, ensuring better accessibility and compliance with WCAG (Web Content Accessibility Guidelines) standards.

## WCAG Contrast Requirements

- **Normal text**: Minimum contrast ratio of 4.5:1 (AA) / 7:1 (AAA)
- **Large text** (18pt+ or 14pt+ bold): Minimum contrast ratio of 3:1 (AA) / 4.5:1 (AAA)
- **UI components and graphical objects**: Minimum contrast ratio of 3:1

## Changes Implemented

### Light Mode Improvements

| Variable | Original Value | New Value | Purpose |
|----------|---------------|-----------|---------|
| `--gray` | 96, 115, 159 | 70, 85, 120 | Darkened for better text contrast |
| `--gray-light` | 229, 233, 240 | 220, 225, 235 | Slightly darkened for better contrast with white backgrounds |
| `--theme-code-bg` | rgba(var(--gray-light), 70%) | rgba(var(--gray-light), 80%) | Increased opacity for better code block readability |
| `--theme-selection-bg` | rgba(var(--gray-light), 70%) | rgba(var(--gray-light), 80%) | Increased opacity for better visibility when text is selected |
| `--theme-border` | rgba(var(--gray), 20%) | rgba(var(--gray), 30%) | Increased opacity for better border visibility |
| `--theme-blockquote-bg` | rgba(var(--gray-light), 50%) | rgba(var(--gray-light), 60%) | Enhanced blockquote background contrast |
| `--theme-table-header-bg` | rgba(var(--gray-light), 50%) | rgba(var(--gray-light), 60%) | Improved table header visibility |
| `--theme-table-row-even` | rgba(var(--gray-light), 20%) | rgba(var(--gray-light), 30%) | Better alternating table row distinction |

### Dark Mode Improvements

| Variable | Original Value | New Value | Purpose |
|----------|---------------|-----------|---------|
| `--theme-text` | rgba(255, 255, 255, 0.9) | rgba(255, 255, 255, 1) | Maximum contrast for text in dark mode |
| `--theme-accent` | #8a96ff | #a3adff | Lightened for better visibility against dark backgrounds |
| `--theme-accent-dark` | #a3adff | #c5cbff | Further lightened for hover states |
| `--theme-code-text` | #e2e2e2 | #ffffff | Pure white for maximum code text contrast |
| `--theme-selection-bg` | rgba(255, 255, 255, 0.15) | rgba(255, 255, 255, 0.25) | Increased opacity for better selection visibility |
| `--theme-border` | rgba(255, 255, 255, 0.2) | rgba(255, 255, 255, 0.35) | Enhanced border visibility in dark mode |
| `--theme-blockquote-bg` | rgba(255, 255, 255, 0.1) | rgba(255, 255, 255, 0.15) | Improved blockquote background visibility |
| `--theme-table-header-bg` | rgba(255, 255, 255, 0.1) | rgba(255, 255, 255, 0.2) | Better table header distinction |
| `--theme-table-row-even` | rgba(255, 255, 255, 0.05) | rgba(255, 255, 255, 0.1) | Improved alternating table row visibility |

## Benefits

1. **Improved Readability**: Text is now more legible across all sections of the site in both light and dark modes.
2. **Better User Experience**: Enhanced contrast makes the site more usable for all users, including those with visual impairments.
3. **WCAG Compliance**: Changes bring the site closer to meeting WCAG AA standards for contrast.
4. **Maintained Design Aesthetic**: Improvements were made while preserving the overall visual design of the site.

## Testing

The contrast improvements were verified by:

1. Visual inspection across different sections of the site
2. Testing in both light and dark modes
3. Checking contrast ratios using WebAIM's contrast checker

## Future Considerations

1. Periodic review of contrast ratios as design evolves
2. User feedback collection on readability
3. Consider automated contrast testing in the CI/CD pipeline 