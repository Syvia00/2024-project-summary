#include "./filtered_string_view.h"

// Implement here
using namespace fsv;

////////////   Constructors   ////////////
// Default Constructor
fsv::filtered_string_view::filtered_string_view() {
	pointer_ = nullptr;
	length = 0;
	cur_predicate = default_predicate;
}

// Implicit String Constructor
fsv::filtered_string_view::filtered_string_view(const std::string& str) {
	pointer_ = str.data();
	length = str.size();
	cur_predicate = default_predicate;
}

// String Constructor with Predicate
fsv::filtered_string_view::filtered_string_view(const std::string& str, filter predicate) {
	size_t count = 0;
	for (char c : str) {
		if (predicate(c)) {
			count++;
		}
	}
	length = count;
	size_t i = 0;
	char* new_string = new char[count];
	for (char c : str) {
		if (predicate(c)) {
			new_string[i++] = c;
		}
	}
	new_string[i] = '\0';
	pointer_ = new_string;
	cur_predicate = predicate;
}

// Implicit Null-Terminated String Constructor
fsv::filtered_string_view::filtered_string_view(const char* str) {
	pointer_ = str;
	length = strlen(str);
	cur_predicate = default_predicate;
}

// Null-Terminated String with Predicate Constructor
fsv::filtered_string_view::filtered_string_view(const char* str, filter predicate) {
	size_t count = 0;
	for (const char* c = str; *c != '\0'; c++) {
		if (predicate(*c)) {
			count++;
		}
	}
	length = count;
	size_t i = 0;
	char* new_string = new char[count];
	for (const char* c = str; *c != '\0'; c++) {
		if (predicate(*c)) {
			new_string[i++] = *c;
		}
	}
	new_string[count] = '\0';
	pointer_ = new_string;
	cur_predicate = predicate;
}

// Copy Constructors
fsv::filtered_string_view::filtered_string_view(const filtered_string_view& other) {
	pointer_ = other.pointer_;
	length = other.length;
	cur_predicate = other.cur_predicate;
}

// Move Constructors
fsv::filtered_string_view::filtered_string_view(filtered_string_view&& other) noexcept {
	pointer_ = other.pointer_;
	length = other.length;
	cur_predicate = other.cur_predicate;
	other.pointer_ = nullptr;
	other.length = 0;
	other.cur_predicate = default_predicate;
}

////////////   Destructors   ////////////
fsv::filtered_string_view::~filtered_string_view() {
	if (!pointer_) {
		delete pointer_;
	}
}
// Cope Assignment
filtered_string_view& fsv::filtered_string_view::operator=(const filtered_string_view& other) {
	if (this == &other) {
		return *this;
	}
	if (this != &other) {
		pointer_ = other.pointer_;
		length = other.length;
		cur_predicate = other.cur_predicate;
	}
	return *this;
}

// Move Assignment
filtered_string_view& fsv::filtered_string_view::operator=(filtered_string_view&& other) noexcept {
	if (this == &other) {
		return *this;
	}
	if (this != &other) {
		pointer_ = other.pointer_;
		length = other.length;
		cur_predicate = other.cur_predicate;
		other.pointer_ = nullptr;
		other.length = 0;
		other.cur_predicate = default_predicate;
	}
	return *this;
}

// Subscript
auto fsv::filtered_string_view::operator[](int n) -> const char& {
	if (n < 0 || n > static_cast<int>(length)) {
		throw std::domain_error{"filtered_string_view::operator[](int n): invalid index"};
	}
	return pointer_[n];
}

// String Type Conversion
fsv::filtered_string_view::operator std::string() {
	std::string result;
	for (size_t i = 0; i < length; i++) {
		if (cur_predicate(pointer_[i])) {
			result += pointer_[i];
		}
	}
	return result;
}

////////////   Member Functions   ////////////
// at
auto fsv::filtered_string_view::at(int index) -> const char& {
	if (index < 0 || index > static_cast<int>(length)) {
		throw std::domain_error{"filtered_string_view::at(<index>): invalid index"};
	}
	return pointer_[index];
}

// size
auto fsv::filtered_string_view::size() -> std::size_t {
	return length;
}

// empty
auto fsv::filtered_string_view::empty() -> bool {
	if (length == 0) {
		return true;
	}
	else {
		return false;
	}
}

// data
auto fsv::filtered_string_view::data() -> const char* {
	return pointer_;
}

// predicate
auto fsv::filtered_string_view::predicate() -> const filter& {
	return cur_predicate;
}

////////////   Iterator   ////////////
// Constructor
fsv::filtered_string_view::iter::iter(const filtered_string_view* fsv, size_t position)
: fsv(fsv)
, position(position) {}

// iter operators
auto fsv::filtered_string_view::iter::operator*() const -> reference {
	return fsv->pointer_[position];
}
auto fsv::filtered_string_view::iter::operator->() const -> const char* {
	return &fsv->pointer_[position];
}
auto fsv::filtered_string_view::iter::operator++() -> iter& {
	++position;
	return *this;
}
auto fsv::filtered_string_view::iter::operator++(int) -> iter {
	iter result = *this;
	++(*this);
	return result;
}
auto fsv::filtered_string_view::iter::operator--() -> iter& {
	--position;
	return *this;
}
auto fsv::filtered_string_view::iter::operator--(int) -> iter {
	iter result = *this;
	--(*this);
	return result;
}
// more operators
auto fsv::filtered_string_view::iter::operator+(int n) -> iter {
	if (static_cast<size_t>(n) + position <= fsv->length) {
		position = static_cast<size_t>(n) + position;
	}
	else {
		position = fsv->length;
	}
	return *this;
}
auto fsv::filtered_string_view::iter::operator-(int n) -> iter {
	if (static_cast<size_t>(n) <= position) {
		position = position - static_cast<size_t>(n);
	}
	else {
		position = static_cast<size_t>(-1);
	}
	return *this;
}

////////////   Range   ////////////
fsv::filtered_string_view::iter fsv::filtered_string_view::begin() const {
	return iter(this, 0);
}
fsv::filtered_string_view::iter fsv::filtered_string_view::cbegin() const {
	return begin();
}

fsv::filtered_string_view::iter fsv::filtered_string_view::end() const {
	return iter(this, length);
}
fsv::filtered_string_view::iter fsv::filtered_string_view::cend() const {
	return end();
}

fsv::filtered_string_view::reverse_iterator fsv::filtered_string_view::rbegin() const {
	return reverse_iterator(end());
}
fsv::filtered_string_view::reverse_iterator fsv::filtered_string_view::crbegin() const {
	return rbegin();
}

fsv::filtered_string_view::reverse_iterator fsv::filtered_string_view::rend() const {
	return reverse_iterator(begin());
}
fsv::filtered_string_view::reverse_iterator fsv::filtered_string_view::crend() const {
	return rend();
}