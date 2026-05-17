import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "./SearchBar";

test("renders search input and button, and triggers search", () => {
  const mockSearch = jest.fn();

  render(<SearchBar onSearch={mockSearch} loading={false} />);

  // Check search input and button exist
  const input = screen.getByPlaceholderText(/search indexed documents/i);
  const button = screen.getByRole("button", { name: /search/i });

  expect(input).toBeInTheDocument();
  expect(button).toBeInTheDocument();

  // Type into input
  fireEvent.change(input, { target: { value: "test query" } });

  // Click search button
  fireEvent.click(button);

  // Expect onSearch to be called with query + filters object
  expect(mockSearch).toHaveBeenCalledWith(
    "test query",
    expect.any(Object)  // filters: { type, startDate, endDate }
  );
});
