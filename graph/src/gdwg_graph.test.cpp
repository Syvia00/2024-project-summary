#include "gdwg_graph.h"

#include <catch2/catch.hpp>

using namespace gdwg;

TEST_CASE("Test Graph Constructors: Initialize") {
	SECTION("Default") {
		auto g = gdwg::graph<std::string, int>{};
		CHECK(g.empty());
	}
	SECTION("Initializer List") {
		auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
		REQUIRE(g.nodes() == std::vector<std::string>{"a", "b", "c"});
	}
	SECTION("InputIt") {
		std::vector<std::string> input{"a", "b", "c"};
		auto g = gdwg::graph<std::string, int>{input.begin(), input.end()};
		REQUIRE(g.nodes() == input);
	}
}

TEST_CASE("Test Graph Constructors: Move") {
	auto g1 = gdwg::graph<std::string, int>{"a", "b", "c"};
	g1.insert_edge("a", "b", 15);
	auto g2 = gdwg::graph<std::string, int>{std::move(g1)};
	REQUIRE(g2.nodes() == std::vector<std::string>{"a", "b", "c"});
	REQUIRE(g2.connections("a") == std::vector<std::string>{"b"});
	REQUIRE(g1.empty());
}

TEST_CASE("Test Graph Constructors: Copy") {
	auto g1 = gdwg::graph<std::string, int>{"a", "b", "c"};
	g1.insert_edge("a", "b", 1);
	auto g2 = gdwg::graph<std::string, int>{g1};
	REQUIRE(g2.nodes() == std::vector<std::string>{"a", "b", "c"});
	REQUIRE(g2.connections("a") == std::vector<std::string>{"b"});
}

TEST_CASE("Test Edge Virtual Functions") {
	SECTION("Weighted_Edge") {
		auto weighted_e = gdwg::weighted_edge<std::string, int>{"a", "b", 1};
		gdwg::edge<std::string, int>* e = &weighted_e;
		REQUIRE(e->print_edge() == "a -> b | W | 1");
		REQUIRE(e->is_weighted() == true);
		REQUIRE(e->get_weight() == 1);
		REQUIRE(e->get_nodes().first == "a");
		REQUIRE(e->get_nodes().second == "b");
		REQUIRE(e == e);
	}
	SECTION("Unweighted_Edge") {
		auto unweighted_e = gdwg::unweighted_edge<std::string, int>{"a", "b"};
		gdwg::edge<std::string, int>* e = &unweighted_e;
		REQUIRE(e->print_edge() == "a -> b | U");
		REQUIRE(e->is_weighted() == false);
		REQUIRE(e->get_weight() == std::nullopt);
		REQUIRE(e->get_nodes().first == "a");
		REQUIRE(e->get_nodes().second == "b");
		REQUIRE(e == e);
	}
}

TEST_CASE("Test Modifiers: Insert Node") {
	auto g = gdwg::graph<std::string, int>{};
	auto n = "aaa";
	g.insert_node(n);
	REQUIRE(g.is_node(n));
}

TEST_CASE("Test Modifiers: Insert Edge") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	g.insert_edge("a", "a");
	REQUIRE(g.insert_edge("a", "b"));
	REQUIRE(g.connections("a") == std::vector<std::string>{"a", "b"});
	SECTION("Error Case") {
		REQUIRE_FALSE(g.insert_edge("a", "b", 1));
		REQUIRE_THROWS_AS(g.insert_edge("a", "d"), std::runtime_error);
	}
}

TEST_CASE("Test Modifiers: Replace Node") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	REQUIRE(g.replace_node("a", "d"));
	REQUIRE(g.nodes() == std::vector<std::string>{"b", "c", "d"});
	REQUIRE(g.connections("b") == std::vector<std::string>{"d"});
	SECTION("Error Case") {
		REQUIRE_THROWS_AS(g.replace_node("e", "d"), std::runtime_error);
		REQUIRE_FALSE(g.replace_node("b", "b"));
	}
}

TEST_CASE("Test Modifiers: Merge Replace Node") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	g.insert_edge("a", "c", 1);
	g.insert_edge("b", "c", 1);
	g.merge_replace_node("a", "b");
	REQUIRE(g.nodes() == std::vector<std::string>{"b", "c"});
	REQUIRE(g.connections("b") == std::vector<std::string>{"b", "c"});
	REQUIRE(g.edges("b", "c").size() == 1);
	SECTION("Error Case") {
		REQUIRE_THROWS_AS(g.merge_replace_node("e", "a"), std::runtime_error);
	}
}

TEST_CASE("Test Modifiers: Erase Node") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	g.insert_edge("a", "c", 1);
	g.insert_edge("b", "c", 1);
	REQUIRE(g.erase_node("a"));
	REQUIRE(g.nodes() == std::vector<std::string>{"b", "c"});
	REQUIRE(g.connections("b") == std::vector<std::string>{"c"});
	SECTION("Not in Graph") {
		REQUIRE_FALSE(g.erase_node("e"));
	}
}

TEST_CASE("Test Modifiers: Erase Edge") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	g.insert_edge("a", "c", 1);
	g.insert_edge("b", "c", 1);
	REQUIRE(g.erase_edge("a", "b", 1));
	REQUIRE(g.nodes() == std::vector<std::string>{"a", "b", "c"});
	REQUIRE(g.connections("b") == std::vector<std::string>{"c"});
	SECTION("Not in Graph && Error") {
		REQUIRE_FALSE(g.erase_edge("a", "b", 2));
		REQUIRE_THROWS_AS(g.erase_edge("e", "e"), std::runtime_error);
	}
}

TEST_CASE("Test Modifiers: Erase Edge Iterator") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	g.insert_edge("a", "b", 7);
	g.insert_edge("a", "b", 11);
	auto it = g.begin();
	it++;
	it = g.erase_edge(it);
	REQUIRE((*it).from == "a");
	REQUIRE((*it).to == "b");
	REQUIRE((*it).weight == 11);
	REQUIRE(g.edges("a", "b").size() == 2);
}

TEST_CASE("Test Modifiers: Erase Edge Iterator Range") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	g.insert_edge("a", "b", 7);
	g.insert_edge("a", "b", 11);
	auto it1 = g.begin();
	auto it2 = g.begin();
	it2++;
	auto it = g.erase_edge(it1, it2);
	REQUIRE((*it).from == "a");
	REQUIRE((*it).to == "b");
	REQUIRE((*it).weight == 7);
	REQUIRE(g.edges("a", "b").size() == 2);
}

TEST_CASE("Test Modifiers: Clear") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	g.clear();
	REQUIRE(g.empty());
}

TEST_CASE("Test Accessors: Is Node") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	REQUIRE(g.is_node("a"));
	REQUIRE_FALSE(g.is_node("e"));
}

TEST_CASE("Test Accessors: Empty") {
	auto g1 = gdwg::graph<std::string, int>{"a", "b", "c"};
	auto g2 = gdwg::graph<std::string, int>{};
	REQUIRE_FALSE(g1.empty());
	REQUIRE(g2.empty());
}

TEST_CASE("Test Accessors: Is Connect") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	REQUIRE(g.is_connected("a", "b"));
	REQUIRE_FALSE(g.is_connected("a", "c"));
	REQUIRE_THROWS_AS(g.is_connected("e", "e"), std::runtime_error);
}

TEST_CASE("Test Accessors: Nodes") {
	SECTION("contain nodes in graph") {
		auto g1 = gdwg::graph<std::string, int>{"a", "c", "b"};
		REQUIRE(g1.nodes() == std::vector<std::string>{"a", "b", "c"});
	}
	SECTION("Empty Graph") {
		auto g2 = gdwg::graph<std::string, int>{};
		REQUIRE(g2.nodes().empty());
	}
}

TEST_CASE("Test Accessors: Edges") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	g.insert_edge("a", "b", 10);
	g.insert_edge("a", "b");
	REQUIRE(g.edges("a", "b").size() == 3);
	REQUIRE_THROWS_AS(g.edges("e", "e"), std::runtime_error);
}

TEST_CASE("Test Accessors: Find") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	auto it = g.find("a", "b", 1);
	REQUIRE((*it).from == "a");
	REQUIRE((*it).to == "b");
	REQUIRE((*it).weight == 1);
	SECTION("INVALID EDGE TO FIND") {
		auto it1 = g.find("a", "c");
		REQUIRE(it1 == g.end());
	}
}

TEST_CASE("Test Accessors: Connections") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	REQUIRE(g.connections("b") == std::vector<std::string>{"a"});
}

TEST_CASE("Test Iterator Access") {
	SECTION("Empty Graph") {
		auto g = gdwg::graph<std::string, int>{};
		REQUIRE(g.begin() == g.end());
	}
	SECTION("begin") {
		auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
		g.insert_edge("a", "b", 1);
		auto it = g.begin();
		REQUIRE(it != g.end());
		REQUIRE((*it).from == "a");
		REQUIRE((*it).to == "b");
		REQUIRE((*it).weight == 1);
	}
	SECTION("end") {
		auto g = gdwg::graph<std::string, int>{"a"};
		auto it = g.begin();
		REQUIRE(it == g.end());
	}
	SECTION("multiple edge") {
		auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
		g.insert_edge("a", "b", 10);
		g.insert_edge("a", "c", 1);
		g.insert_edge("a", "b", 1);
		auto it = g.begin();
		REQUIRE(it != g.end());
		REQUIRE((*it).from == "a");
		REQUIRE((*it).to == "b");
		REQUIRE((*it).weight == 1);
	}
}

TEST_CASE("Test Comparison") {
	auto g1 = gdwg::graph<std::string, int>{"a", "b", "c"};
	g1.insert_edge("a", "b", 10);
	g1.insert_edge("a", "c", 1);
	g1.insert_edge("a", "b");
	SECTION("Compare same graph") {
		auto g2 = gdwg::graph<std::string, int>{"a", "b", "c"};
		g2.insert_edge("a", "b", 10);
		g2.insert_edge("a", "c", 1);
		g2.insert_edge("a", "b");
		REQUIRE(g1 == g2);
	}
	SECTION("Compare diff Graph") {
		auto g2 = gdwg::graph<std::string, int>{"a", "b"};
		g2.insert_edge("a", "b", 10);
		REQUIRE_FALSE(g1 == g2);
	}
	SECTION("Compare More Complex Graph") {
		auto g2 = gdwg::graph<std::string, int>{"a", "b", "c"};
		g2.insert_edge("a", "b", 10);
		g2.insert_edge("a", "c", 1);
		g2.insert_edge("a", "b", 2);
		g2.insert_edge("a", "b");
		REQUIRE_FALSE(g1 == g2);
	}
}

TEST_CASE("Test Extractor") {
	SECTION("Normal Graph") {
		auto g = gdwg::graph<std::string, int>{"a", "b", "c", "d", "e"};
		g.insert_edge("a", "b", 1);
		g.insert_edge("a", "b", 10);
		g.insert_edge("a", "b");
		g.insert_edge("b", "c", 1);
		g.insert_edge("b", "d", -1);
		g.insert_edge("c", "c");
		g.insert_edge("c", "c", 100);
		g.insert_edge("d", "c", 100);
		g.insert_edge("d", "a", 10);
		auto out = std::ostringstream{};
		out << g;
		auto const expected_output = std::string_view(R"(a (
  a -> b | U
  a -> b | W | 1
  a -> b | W | 10
)
b (
  b -> c | W | 1
  b -> d | W | -1
)
c (
  c -> c | U
  c -> c | W | 100
)
d (
  d -> a | W | 10
  d -> c | W | 100
)
e (
)
)");
		REQUIRE(out.str() == expected_output);
	}
	SECTION("Empty Graph") {
		auto g = gdwg::graph<std::string, int>{};
		auto out = std::ostringstream{};
		out << g;
		auto const expected_output = std::string_view(R"()");
		REQUIRE(out.str() == expected_output);
	}
}

TEST_CASE("Test Iterator: Constructor") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	auto it1 = gdwg::graph<std::string, int>::iterator{};
	auto it2 = gdwg::graph<std::string, int>::iterator{};
	REQUIRE(it1 == it2);
}

TEST_CASE("Test Iterator: Source") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	auto it = g.begin();
	REQUIRE((*it).from == "a");
	REQUIRE((*it).to == "b");
	REQUIRE((*it).weight == 1);
}

TEST_CASE("Test Iterator: Traversal++") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	SECTION("same node") {
		g.insert_edge("a", "b", 1);
		g.insert_edge("a", "b", 10);
		auto it = g.begin();
		it++;
		REQUIRE((*it).from == "a");
		REQUIRE((*it).to == "b");
		REQUIRE((*it).weight == 10);
	}
	SECTION("diff node") {
		g.insert_edge("a", "b", 1);
		g.insert_edge("c", "b", 10);
		auto it = g.begin();
		it++;
		REQUIRE((*it).from == "c");
		REQUIRE((*it).to == "b");
		REQUIRE((*it).weight == 10);
	}
	SECTION("at end") {
		g.insert_edge("a", "b", 1);
		auto it = g.begin();
		it++;
		REQUIRE(it == g.end());
	}
}

TEST_CASE("Test Iterator: Traversal--") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	SECTION("same node") {
		g.insert_edge("a", "b", 1);
		g.insert_edge("a", "b", 10);
		auto it = g.end();
		it--;
		REQUIRE((*it).from == "a");
		REQUIRE((*it).to == "b");
		REQUIRE((*it).weight == 10);
	}
	SECTION("diff node") {
		g.insert_edge("a", "b", 1);
		g.insert_edge("c", "b", 10);
		auto it = g.end();
		it--;
		REQUIRE((*it).from == "c");
		REQUIRE((*it).to == "b");
		REQUIRE((*it).weight == 10);
	}
	SECTION("at begin") {
		g.insert_edge("a", "b", 1);
		auto it = g.end();
		it--;
		it--;
		REQUIRE(it == g.begin());
	}
}

TEST_CASE("Test Iterator: Comparison") {
	auto g = gdwg::graph<std::string, int>{"a", "b", "c"};
	g.insert_edge("a", "b", 1);
	g.insert_edge("a", "b", 10);
	auto it1 = g.begin();
	auto it2 = g.end();
	auto it3 = g.begin();
	REQUIRE(it1 == it3);
	REQUIRE_FALSE(it1 == it2);
}