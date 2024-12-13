#include "./filtered_string_view.h"

#include <catch2/catch.hpp>
using namespace fsv;

TEST_CASE("Test Constructor: Default Constructor") {
	fsv::filtered_string_view f;
	REQUIRE(f.data() == nullptr);
	REQUIRE(f.size() == 0);
}

TEST_CASE("Test Constructor: Implicit String Constructor") {
	std::string str = "teststring";
	fsv::filtered_string_view f(str);
	REQUIRE(f.data() == str.data());
	REQUIRE(f.size() == str.size());
	REQUIRE(f.predicate()('a'));
}

TEST_CASE("Test Constructor: String Constructor with Predicate") {
	std::string str = "teststring";
	auto test_predicate = [](const char& c) { return c == 't'; };
	fsv::filtered_string_view f(str, test_predicate);
	std::string pre = "ttt";
	REQUIRE(f.size() == pre.size());
	REQUIRE(f.predicate()('t'));
}

TEST_CASE("Test Constructor: Implicit Null-Terminated String Constructor") {
	const char* str = "teststring";
	fsv::filtered_string_view f(str);
	REQUIRE(std::equal(f.begin(), f.end(), str, str + std::strlen(str)));
	REQUIRE(f.size() == std::strlen(str));
	REQUIRE(f.predicate()('a'));
}

TEST_CASE("Test Constructor: Null-Terminated String with Predicate Constructor") {
	const char* str = "teststring";
	auto test_predicate = [](const char& c) { return c == 't'; };
	fsv::filtered_string_view f(str, test_predicate);
	const char* pre = "ttt";
	REQUIRE(std::equal(f.begin(), f.end(), pre, pre + std::strlen(pre)));
	REQUIRE(f.size() == std::strlen(pre));
	REQUIRE(f.predicate()('t'));
}

TEST_CASE("Test Constructor: Copy Constructor") {
	std::string str = "teststring";
	fsv::filtered_string_view f1(str);
	fsv::filtered_string_view f2(f1);
	REQUIRE(std::equal(f1.begin(), f1.end(), f2.begin(), f2.end()));
	REQUIRE(f2.size() == f1.size());
}

TEST_CASE("Test Constructor: Move Constructor") {
	std::string str = "teststring";
	fsv::filtered_string_view f1(str);
	fsv::filtered_string_view f2(std::move(f1));
	REQUIRE(f2.size() == str.size());
	REQUIRE(f1.size() == 0);
	REQUIRE(f1.data() == nullptr);
}

TEST_CASE("Test Member Operator: Copy Assignment") {
	std::string str = "teststring";
	fsv::filtered_string_view f1(str);
	fsv::filtered_string_view f2;
	f2 = f1;
	REQUIRE(std::equal(f1.begin(), f1.end(), f2.begin(), f2.end()));
	REQUIRE(f2.size() == f1.size());
}

TEST_CASE("Test Member Operator: Move Assignment") {
	std::string str = "teststring";
	fsv::filtered_string_view f1(str);
	fsv::filtered_string_view f2;
	f2 = std::move(f1);
	REQUIRE(f2.size() == str.size());
	REQUIRE(f1.size() == 0);
	REQUIRE(f1.data() == nullptr);
}

TEST_CASE("Test Member Operator: Subscript") {
	std::string str = "teststring";
	fsv::filtered_string_view f(str);
	for (size_t i = 0; i < str.size(); i++) {
		REQUIRE(f[static_cast<int>(i)] == str[i]);
	}
}

TEST_CASE("Test Member Operator: String Type Conversion") {
	std::string str = "teststring";
	fsv::filtered_string_view f(str);
	std::string s = static_cast<std::string>(f);
	std::string pre = "teststring";
	REQUIRE(s == pre);
}

TEST_CASE("Test Member Function: at") {
	std::string str = "testtesttest";
	fsv::filtered_string_view f(str);
	SECTION("when index is valid") {
		for (size_t i = 0; i < str.size(); ++i) {
			REQUIRE(f.at(static_cast<int>(i)) == str[i]);
		}
	}
	SECTION("when index invalid") {
		REQUIRE_THROWS_AS(f.at(-100), std::domain_error);
	}
}

TEST_CASE("Test Member Function: size") {
	std::string str = "testtesttest";
	fsv::filtered_string_view f(str);
	REQUIRE(f.size() == str.size());
}

TEST_CASE("Test Member Function: empty") {
	SECTION("not empty") {
		std::string str = "testtesttest";
		fsv::filtered_string_view f1(str);
		REQUIRE_FALSE(f1.empty());
	}
	SECTION("empty") {
		fsv::filtered_string_view f2;
		REQUIRE(f2.empty());
	}
}

TEST_CASE("Test Member Function: data") {
	std::string str = "testtesttest";
	fsv::filtered_string_view f(str);
	REQUIRE(f.data() == str.data());
}

TEST_CASE("Test Member Function: predicate") {
	std::string str = "testtesttest";
	auto test_predicate = [](const char& c) { return c == 'a'; };
	fsv::filtered_string_view f(str, test_predicate);
	REQUIRE(f.predicate()('a'));
}

TEST_CASE("Test Non-Member Operators: Equality Comparison + Relational Comparison") {
	std::string str1 = "ccccccc";
	std::string str2 = "mnmnmnm";
	fsv::filtered_string_view f1(str1);
	fsv::filtered_string_view f2(str2);
	SECTION("==") {
		REQUIRE(f1 == f1);
	}
	SECTION("!=") {
		REQUIRE(f1 != f2);
	}
	SECTION("<") {
		REQUIRE(f1 < f2);
	}
	SECTION(">") {
		REQUIRE(f2 > f1);
	}
	SECTION("<=") {
		REQUIRE(f1 <= f2);
		REQUIRE(f1 <= f1);
	}
	SECTION(">=") {
		REQUIRE(f2 >= f1);
		REQUIRE(f1 >= f1);
	}
}

TEST_CASE("Test Non-Member Operators: Output Stream") {
	std::string str = "ttttttest";
	fsv::filtered_string_view f(str);
	std::stringstream ss;
	ss << f;
	REQUIRE(ss.str() == "ttttttest");
}

TEST_CASE("Test Non-Member Utility Functions: compose") {
	auto test_filter = std::vector<filter>{[](const char& c) { return c == 'a' || c == 'b' || c == 'c'; },
	                                       [](const char& c) { return c > ' '; },
	                                       [](const char& c) { return c == 'p' || true; }};
	fsv::filtered_string_view f("abc ab");
	auto result = compose(f, test_filter);
	REQUIRE(static_cast<std::string>(result) == "abcab");
}

TEST_CASE("Test Non-Member Utility Functions: split") {
	fsv::filtered_string_view f("aaav,bbbd,cccadf", [](const char& c) { return c != 'a'; });
	fsv::filtered_string_view tok(",");
	auto result = split(f, tok);
	auto expected = std::vector<fsv::filtered_string_view>{"v", "bbbd", "cccdf"};
	REQUIRE(result.size() == 3);
	REQUIRE(result == expected);
}

TEST_CASE("Test Non-Member Utility Functions: substr") {
	std::string str = "test test test";
	auto test_predicate = [](const char& c) { return c != 't'; };
	fsv::filtered_string_view f(str, test_predicate);
	SECTION("coount <= 0") {
		auto result = substr(f, 4, -1);
		REQUIRE(static_cast<std::string>(result) == "s es");
	}
	SECTION("count > 0") {
		auto result = substr(f, 2, 3);
		REQUIRE(static_cast<std::string>(result) == " es");
	}
}

TEST_CASE("Test Range") {
	std::string str = "abc";
	fsv::filtered_string_view f(str);

	SECTION("begin, end") {
		auto v = std::vector<char>{f.begin(), f.end()};
		REQUIRE(v.size() == 3);
		REQUIRE(v[0] == 'a');
		REQUIRE(v[1] == 'b');
		REQUIRE(v[2] == 'c');
	}

	SECTION("rbegin. rend") {
		auto v = std::vector<char>{f.rbegin(), f.rend()};
		REQUIRE(v.size() == 3);
		REQUIRE(v[0] == 'c');
		REQUIRE(v[1] == 'b');
		REQUIRE(v[2] == 'a');
	}

	SECTION("cbegin, cend") {
		auto v = std::vector<char>{f.cbegin(), f.cend()};
		REQUIRE(v.size() == 3);
		REQUIRE(v[0] == 'a');
		REQUIRE(v[1] == 'b');
		REQUIRE(v[2] == 'c');
	}

	SECTION("crbegin, crend") {
		auto v = std::vector<char>{f.crbegin(), f.crend()};
		REQUIRE(v.size() == 3);
		REQUIRE(v[0] == 'c');
		REQUIRE(v[1] == 'b');
		REQUIRE(v[2] == 'a');
	}
}

TEST_CASE("Test Iterator") {
	std::string str = "a=bcd=ef";
	auto test_predicate = [](const char& c) { return !(c == '='); };
	fsv::filtered_string_view f(str, test_predicate);
	auto start = f.begin();
	auto end = f.end();
	SECTION("operator*") {
		REQUIRE(*start == 'a');
	}
	SECTION("operator++") {
		++start;
		REQUIRE(*start == 'b');
	}
	SECTION("operator--") {
		--end;
		REQUIRE(*end == 'f');
	}
	SECTION("operator+") {
		start = start + 2;
		REQUIRE(*start == 'c');
	}
	SECTION("operator-") {
		end = end - 2;
		REQUIRE(*end == 'e');
	}
}