#ifndef COMP6771_ASS2_FSV_H
#define COMP6771_ASS2_FSV_H

#include <compare>
#include <cstring>
#include <functional>
#include <iostream>
#include <iterator>
#include <optional>
#include <string>

namespace fsv {
	using filter = std::function<bool(const char&)>;
	class filtered_string_view {
		class iter {
		 public:
			using iterator_category = std::bidirectional_iterator_tag;
			using value_type = char;
			using reference = const char&;
			using pointer = void;
			using difference_type = std::ptrdiff_t;

			iter() = default;
			explicit iter(const filtered_string_view* fsv, size_t position);

			auto operator*() const -> reference;
			auto operator->() const -> const char*;

			auto operator++() -> iter&;
			auto operator++(int) -> iter;
			auto operator--() -> iter&;
			auto operator--(int) -> iter;

			// Equality Comparison
			friend auto operator==(const iter& lhs, const iter& rhs) -> bool {
				bool result;
				result = false;
				if (lhs.fsv == rhs.fsv && lhs.position == rhs.position) {
					result = true;
				}
				return result;
			}
			friend auto operator!=(const iter& lhs, const iter& rhs) -> bool {
				return !(lhs == rhs);
			}

			// Based on original operator write + and -
			auto operator+(int) -> iter;
			auto operator-(int) -> iter;

		 private:
			/* Implementation-specific private members */
			const filtered_string_view* fsv;
			size_t position;
		};

	 public:
		using iterator = iter;
		using const_iterator = iter;
		using reverse_iterator = std::reverse_iterator<iter>;
		using const_reverse_iterator = std::reverse_iterator<iter>;
		//// Static Data Member ////
		static bool default_predicate(const char&) {
			return true;
		};

		//// Constructors ////
		filtered_string_view();
		filtered_string_view(const std::string& str);
		filtered_string_view(const std::string& str, filter predicate);
		filtered_string_view(const char* str);
		filtered_string_view(const char* str, filter predicate);
		filtered_string_view(const filtered_string_view& other);
		filtered_string_view(filtered_string_view&& other) noexcept;

		//// Destructor ////
		~filtered_string_view();
		filtered_string_view& operator=(const filtered_string_view& other);
		filtered_string_view& operator=(filtered_string_view&& other) noexcept;
		auto operator[](int n) -> const char&;
		explicit operator std::string();

		//// Member Function ////
		auto at(int index) -> const char&;
		auto size() -> std::size_t;
		auto empty() -> bool;
		auto data() -> const char*;
		auto predicate() -> const filter&;

		//// Non-Member Operators ////
		// Equality Comparison
		friend auto operator==(const filtered_string_view& lhs, const filtered_string_view& rhs) -> bool {
			bool result;
			result = false;
			if (lhs.length == rhs.length && std::strcmp(lhs.pointer_, rhs.pointer_) == 0) {
				result = true;
			}
			return result;
		}
		friend auto operator!=(const filtered_string_view& lhs, const filtered_string_view& rhs) -> bool {
			return !(lhs == rhs);
		}

		// Relational Comparison
		friend auto operator<=>(const filtered_string_view& lhs, const filtered_string_view& rhs)
		    -> std::strong_ordering {
			// when length differ
			if (lhs.length < rhs.length) {
				return std::strong_ordering::less;
			}
			else if (lhs.length > rhs.length) {
				return std::strong_ordering::greater;
			}
			// when same length
			int result = std::strcmp(lhs.pointer_, rhs.pointer_);
			if (result < 0) {
				return std::strong_ordering::less;
			}
			else if (result > 0) {
				return std::strong_ordering::greater;
			}
			else {
				return std::strong_ordering::equal;
			}
		}

		// Adding the seperate operators
		friend auto operator<(const filtered_string_view& lhs, const filtered_string_view& rhs) -> bool {
			return (lhs <=> rhs) == std::strong_ordering::less;
		}
		friend auto operator>(const filtered_string_view& lhs, const filtered_string_view& rhs) -> bool {
			return (lhs <=> rhs) == std::strong_ordering::greater;
		}
		friend auto operator<=(const filtered_string_view& lhs, const filtered_string_view& rhs) -> bool {
			return (lhs <=> rhs) != std::strong_ordering::greater;
		}
		friend auto operator>=(const filtered_string_view& lhs, const filtered_string_view& rhs) -> bool {
			return (lhs <=> rhs) != std::strong_ordering::less;
		}

		// Output Stream
		friend auto operator<<(std::ostream& os, const filtered_string_view& fsv) -> std::ostream& {
			std::string result;
			for (size_t i = 0; i < fsv.length; i++) {
				if (fsv.cur_predicate(fsv.pointer_[i])) {
					result += fsv.pointer_[i];
				}
			}
			return os << result;
		}

		//// Non-Member Utility Functions ////
		// compose
		friend auto compose(const filtered_string_view& fsv, const std::vector<filter>& filts) -> filtered_string_view {
			char* new_string = new char[fsv.length];
			size_t l = 0;
			for (size_t i = 0; i < fsv.length; i++) {
				bool check = true;
				for (const auto& filt : filts) {
					if (!filt(fsv.pointer_[i])) {
						check = false;
						break;
					}
				}
				if (check) {
					new_string[l++] = fsv.pointer_[i];
				}
			}
			new_string[l] = '\0';
			return filtered_string_view(new_string, fsv.cur_predicate);
		}

		// split
		friend auto split(const filtered_string_view& fsv, const filtered_string_view& tok)
		    -> std::vector<filtered_string_view> {
			std::vector<filtered_string_view> result;
			// if tok not appear in fsv or its empty
			if (tok.length == 0 || std::strstr(fsv.pointer_, tok.pointer_) == nullptr) {
				result.push_back(fsv);
				return result;
			}
			// if fsv is empty
			if (fsv.length == 0) {
				result.push_back(fsv);
				return result;
			}
			// find split tok
			const char* begin = fsv.pointer_;
			const char* end = fsv.pointer_ + fsv.length;
			while (begin < end) {
				const char* find = std::strstr(begin, tok.pointer_);
				if (find == nullptr) {
					break;
				}
				std::size_t part_length = strlen(find) - strlen(begin);
				// copy data from begin with length to new_str
				const char* c = begin;
				char* new_string = new char[part_length];
				size_t i;
				for (i = 0; i < part_length; i++) {
					new_string[i] = *c;
					c++;
				}
				new_string[i] = '\0';
				result.push_back(fsv::filtered_string_view(new_string, fsv.cur_predicate));
				begin = find + static_cast<int>(tok.length);
			}
			// if have char at end without tok
			if (begin < end) {
				std::size_t part_length = strlen(end) - strlen(begin);
				// copy data from begin with length to new_str
				const char* c = begin;
				char* new_string = new char[part_length];
				size_t i;
				for (i = 0; i < part_length; i++) {
					new_string[i] = *c;
					c++;
				}
				new_string[i] = '\0';
				result.push_back(fsv::filtered_string_view(new_string, fsv.cur_predicate));
			}
			return result;
		}

		// substr
		friend auto substr(const filtered_string_view& fsv, int pos, int count) -> filtered_string_view {
			size_t rcount;
			if (count <= 0) {
				rcount = fsv.length - static_cast<size_t>(pos);
			}
			else {
				rcount = static_cast<size_t>(count);
			}
			if (rcount == 0) {
				return filtered_string_view("", fsv.cur_predicate);
			}
			return filtered_string_view(fsv.pointer_ + static_cast<size_t>(pos), rcount, fsv.cur_predicate);
		};

		//// Range ////
		iter begin() const;
		iter cbegin() const;
		iter end() const;
		iter cend() const;
		reverse_iterator rbegin() const;
		reverse_iterator crbegin() const;
		reverse_iterator rend() const;
		reverse_iterator crend() const;

	 private:
		const char* pointer_;
		size_t length;
		filter cur_predicate;

		// Function for use in split
		filtered_string_view(const char* begin, size_t len, filter predicate) {
			pointer_ = begin;
			length = len;
			cur_predicate = predicate;
		}
	};
} // namespace fsv

#endif // COMP6771_ASS2_FSV_H
