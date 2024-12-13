#ifndef GDWG_GRAPH_H
#define GDWG_GRAPH_H

#include <initializer_list>
#include <algorithm>
#include <iostream>
#include <map>
#include <memory>
#include <optional>
#include <ostream>
#include <set>
#include <string>
#include <vector>

namespace gdwg {
	// declaration at begin
	template<typename N, typename E>
	class graph;

	///////////////////////////////////////////
	//**********    Edge Class     **********//
	///////////////////////////////////////////

	template<typename N, typename E>
	class edge {
	 public:
		// pure virtual fucntions
		virtual ~edge() = default;
		virtual auto print_edge() const -> std::string = 0;
		virtual auto is_weighted() const -> bool = 0;
		virtual auto get_weight() const -> std::optional<E> = 0;
		virtual auto get_nodes() const -> std::pair<N, N> = 0;
		virtual auto operator==(edge const& other) -> bool = 0;

	 private:
		// You may need to add data members and member functions
		friend class graph<N, E>;
	};

	//// weighted_edge class inherits from edge ////
	template<typename N, typename E>
	class weighted_edge : public edge<N, E> {
	 public:
		// constructor
		weighted_edge(N const& src, N const& dst, E const& weight)
		: src_(src)
		, dst_(dst)
		, weight_(weight) {}

		// virtual function from edge class
		auto print_edge() const -> std::string override {
			return src_ + " -> " + dst_ + " | W | " + std::to_string(weight_);
		}
		auto is_weighted() const -> bool override {
			return true;
		}
		auto get_weight() const -> std::optional<E> override {
			return weight_;
		}
		auto get_nodes() const -> std::pair<N, N> override {
			return {src_, dst_};
		}
		auto operator==(edge<N, E> const& other) -> bool override {
			if (auto* other_w = dynamic_cast<weighted_edge const*>(&other)) {
				return this->get_nodes() == other_w->get_nodes() && weight_ == other_w->weight_;
			}
			return false;
		}

	 private:
		N src_;
		N dst_;
		E weight_;
	};

	//// unweighted_edge class inherits from edge ////
	template<typename N, typename E>
	class unweighted_edge : public edge<N, E> {
	 public:
		// constructor
		unweighted_edge(N const& src, N const& dst)
		: src_(src)
		, dst_(dst) {}

		// virtual function from edge class
		auto print_edge() const -> std::string override {
			return src_ + " -> " + dst_ + " | U";
		}
		auto is_weighted() const -> bool override {
			return false;
		}
		auto get_weight() const -> std::optional<E> override {
			return std::nullopt;
		}
		auto get_nodes() const -> std::pair<N, N> override {
			return {src_, dst_};
		}
		auto operator==(edge<N, E> const& other) -> bool override {
			if (auto* other_uw = dynamic_cast<unweighted_edge const*>(&other)) {
				return this->get_nodes() == other_uw->get_nodes();
			}
			return false;
		}

	 private:
		N src_;
		N dst_;
	};

	///////////////////////////////////////////
	//**********    Graph Class    **********//
	///////////////////////////////////////////

	template<typename N, typename E>
	class graph {
	 public:
		class iterator;
		using edge = gdwg::edge<N, E>;

		// Your member functions go here

		////////  Constructor  ////////
		graph() noexcept = default;

		// initial list
		graph(std::initializer_list<N> il)
		: graph(il.begin(), il.end()) {}

		// input Iterator
		template<typename InputIt>
		graph(InputIt first, InputIt last) {
			for (auto it = first; it != last; ++it) {
				if (nodes_.find(*it) == nodes_.end()) {
					nodes_.insert(*it);
				}
			}
		}

		// move constructor
		graph(graph&& other) noexcept {
			*this = std::move(other);
		}

		// move operator
		auto operator=(graph&& other) noexcept -> graph& {
			if (this != &other) {
				nodes_ = std::move(other.nodes_);
				edges_ = std::move(other.edges_);
				connect_ = std::move(other.connect_);
				other.clear();
			}
			return *this;
		}

		// copy constructor
		graph(graph const& other) {
			*this = other;
		}

		// copy operator
		auto operator=(graph const& other) -> graph& {
			if (this != &other) {
				for (auto& n : other.nodes_) {
					nodes_.insert(n);
				}
				// copy connect from other graph
				for (const auto& e : other.connect_) {
					connect_.emplace(e.first, e.second);
				}
				// copy edge from other graph
				for (const auto& e : other.edges_) {
					edges_.push_back(e);
				}
			}
			return *this;
		}

		/////////////////////////////
		////////  Modifiers  ////////
		/////////////////////////////

		auto insert_node(N const& value) -> bool {
			if (nodes_.count(value) != 0) {
				return false;
			}
			nodes_.insert(value);
			return true;
		}

		auto insert_edge(N const& src, N const& dst, std::optional<E> weight = std::nullopt) -> bool {
			// check src and dst are node
			if (!is_node(src) || !is_node(dst)) {
				throw std::runtime_error("Cannot call gdwg::graph<N, E>::insert_edge when either src or dst node does "
				                         "not "
				                         "exist");
			}
			// check no two edge are same
			auto& src_edges = connect_[src];
			for (const auto& e : src_edges) {
				if (e->get_nodes().second == dst && e->get_weight() == weight) {
					return false;
				}
			}
			// add new edge
			std::shared_ptr<edge> edge_ptr;
			if (weight) {
				edge_ptr = std::make_shared<weighted_edge<N, E>>(src, dst, *weight);
			}
			else {
				edge_ptr = std::make_shared<unweighted_edge<N, E>>(src, dst);
			}

			edges_.push_back(edge_ptr);
			src_edges.push_back(edge_ptr);
			sort(edges_.begin(), edges_.end(), gdwg::graph<N, E>::compareEdge);
			sort(src_edges.begin(), src_edges.end(), gdwg::graph<N, E>::compareEdge);
			return true;
		}

		auto replace_node(N const& old_data, N const& new_data) -> bool {
			if (!is_node(old_data)) {
				throw std::runtime_error("Cannot call gdwg::graph<N, E>::replace_node on a node that doesn't exist");
			}
			if (nodes_.count(new_data) == 1) {
				return false;
			}

			// replace node
			nodes_.erase(old_data);
			nodes_.insert(new_data);

			// replace related edges start with src in connect
			auto& all_edges = connect_[old_data];
			for (auto& e : all_edges) {
				if (e->is_weighted()) {
					e = std::make_shared<weighted_edge<N, E>>(new_data, e->get_nodes().second, *(e->get_weight()));
				}
				else {
					e = std::make_shared<unweighted_edge<N, E>>(new_data, e->get_nodes().second);
				}
			}
			sort(all_edges.begin(), all_edges.end(), gdwg::graph<N, E>::compareEdge);

			// replace edges in edge list
			for (auto& e : edges_) {
				if (e->get_nodes().first == old_data) {
					if (e->is_weighted()) {
						e = std::make_shared<weighted_edge<N, E>>(new_data, e->get_nodes().second, *(e->get_weight()));
					}
					else {
						e = std::make_shared<unweighted_edge<N, E>>(new_data, e->get_nodes().second);
					}
				}
				if (e->get_nodes().second == old_data) {
					// replace edge that at distinat
					auto& dst_edges = connect_[e->get_nodes().first];
					for (auto& e_dst : dst_edges) {
						if (e_dst->get_nodes().second == old_data) {
							if (e_dst->is_weighted()) {
								e_dst = std::make_shared<weighted_edge<N, E>>(e->get_nodes().first,
								                                              new_data,
								                                              *(e_dst->get_weight()));
							}
							else {
								e_dst = std::make_shared<unweighted_edge<N, E>>(e->get_nodes().first, new_data);
							}
						}
					}
					sort(dst_edges.begin(), dst_edges.end(), gdwg::graph<N, E>::compareEdge);
					if (e->is_weighted()) {
						e = std::make_shared<weighted_edge<N, E>>(e->get_nodes().first, new_data, *(e->get_weight()));
					}
					else {
						e = std::make_shared<unweighted_edge<N, E>>(e->get_nodes().first, new_data);
					}
				}
			}
			sort(edges_.begin(), edges_.end(), gdwg::graph<N, E>::compareEdge);
			connect_[new_data] = std::move(connect_[old_data]);
			connect_.erase(old_data);

			return true;
		}

		auto merge_replace_node(N const& old_data, N const& new_data) -> void {
			if (!is_node(old_data) || !is_node(new_data)) {
				throw std::runtime_error("Cannot call gdwg::graph<N, E>::replace_node on a node that doesn't exist");
			}
			// replace node
			if (nodes_.count(new_data) == 1) {
				nodes_.erase(old_data);
				nodes_.insert(new_data);
			}

			// replace edges in edge list
			for (auto& e : edges_) {
				if (e->get_nodes().first == old_data) {
					if (e->is_weighted()) {
						e = std::make_shared<weighted_edge<N, E>>(new_data, e->get_nodes().second, *(e->get_weight()));
					}
					else {
						e = std::make_shared<unweighted_edge<N, E>>(new_data, e->get_nodes().second);
					}
				}
				if (e->get_nodes().second == old_data) {
					// replace edge that at distinat
					auto& dst_edges = connect_[e->get_nodes().first];
					for (auto& e_dst : dst_edges) {
						if (e_dst->get_nodes().second == old_data) {
							if (e_dst->is_weighted()) {
								e_dst = std::make_shared<weighted_edge<N, E>>(e->get_nodes().first,
								                                              new_data,
								                                              *(e_dst->get_weight()));
							}
							else {
								e_dst = std::make_shared<unweighted_edge<N, E>>(e->get_nodes().first, new_data);
							}
						}
					}
					dst_edges.erase(unique(dst_edges.begin(), dst_edges.end()), dst_edges.end());
					sort(dst_edges.begin(), dst_edges.end(), gdwg::graph<N, E>::compareEdge);
					if (e->is_weighted()) {
						e = std::make_shared<weighted_edge<N, E>>(e->get_nodes().first, new_data, *(e->get_weight()));
					}
					else {
						e = std::make_shared<unweighted_edge<N, E>>(e->get_nodes().first, new_data);
					}
				}
			}

			// replace related edges start with src in connect
			auto& all_edges = connect_[old_data];
			for (auto& e : all_edges) {
				if (e->is_weighted()) {
					e = std::make_shared<weighted_edge<N, E>>(new_data, e->get_nodes().second, *(e->get_weight()));
				}
				else {
					e = std::make_shared<unweighted_edge<N, E>>(new_data, e->get_nodes().second);
				}
			}
			connect_[new_data] = std::move(connect_[old_data]);
			connect_.erase(old_data);

			// merge same edge
			connect_[new_data].erase(unique(connect_[new_data].begin(), connect_[new_data].end()),
			                         connect_[new_data].end());
			edges_.erase(unique(edges_.begin(), edges_.end()), edges_.end());
			sort(connect_[new_data].begin(), connect_[new_data].end(), gdwg::graph<N, E>::compareEdge);
			sort(edges_.begin(), edges_.end(), gdwg::graph<N, E>::compareEdge);
		}

		auto erase_node(N const& value) -> bool {
			if (!is_node(value)) {
				return false;
			}

			// remove from edge that at distination
			for (auto& n : nodes_) {
				auto& es = connect_[n];
				es.erase(std::remove_if(es.begin(),
				                        es.end(),
				                        [&value](const auto es) -> bool { return es->get_nodes().second == value; }),
				         es.end());
			}

			// remove from edges_
			edges_.erase(std::remove_if(edges_.begin(),
			                            edges_.end(),
			                            [&value](const auto edges_) -> bool {
				                            return edges_->get_nodes().first == value
				                                   || edges_->get_nodes().second == value;
			                            }),
			             edges_.end());
			// remove all edge related
			auto& erase_edges = connect_[value];
			erase_edges.clear();
			// erase node
			nodes_.erase(value);
			return true;
		}

		auto erase_edge(N const& src, N const& dst, std::optional<E> weight = std::nullopt) -> bool {
			// check whether is node
			if (!is_node(src) || !is_node(dst)) {
				throw std::runtime_error("Cannot call gdwg::graph<N, E>::erase_edge on src or dst if they don't exist "
				                         "in the "
				                         "graph");
			}
			// loop throw related edges
			auto src_edges = connect_.find(src);
			// if node have no edge
			if (src_edges == connect_.end()) {
				std::cout << "n\n";
				return false;
			}
			// find edge exist
			auto edge_it =
			    std::find_if(src_edges->second.begin(), src_edges->second.end(), [&dst, &weight](const auto& e) {
				    return e->get_nodes().second == dst && (!weight || e->get_weight() == weight);
			    });
			// if not exist
			if (edge_it == src_edges->second.end()) {
				return false;
			}
			// erase edge
			src_edges->second.erase(edge_it);
			// remove from edges_
			edges_.erase(std::remove_if(edges_.begin(),
			                            edges_.end(),
			                            [&src, &dst, &weight](const auto edges_) -> bool {
				                            return edges_->get_nodes().first == src && edges_->get_nodes().second == dst
				                                   && edges_->get_weight() == weight;
			                            }),
			             edges_.end());
			return true;
		}

		auto erase_edge(iterator i) -> iterator {
			if (i == end()) {
				return end();
			}
			std::string from = (*i).from;
			std::string to = (*i).to;
			int weight = (*i).weight.value();
			for (auto& e : edges_) {
				if ((*i).from == e->get_nodes().first && (*i).to == e->get_nodes().second
				    && (*i).weight.value() == e->get_weight().value())
				{
					erase_edge(from, to, weight);
					break;
				}
			}
			return i;
		}

		auto erase_edge(iterator i, iterator s) -> iterator {
			N from = (*s).from;
			N to = (*s).to;
			E weight = (*s).weight.value();
			while (i != end()) {
				if ((*i).weight.value() == weight && (*i).from == from && (*i).to == to) {
					break;
				}
				i = erase_edge(i);
			}
			return i;
		}

		auto clear() noexcept -> void {
			nodes_.clear();
			connect_.clear();
			edges_.clear();
		}

		/////////////////////////////
		////////  Accessors  ////////
		/////////////////////////////

		[[nodiscard]] auto is_node(N const& value) const -> bool {
			return nodes_.find(value) != nodes_.end();
		}

		[[nodiscard]] auto empty() const -> bool {
			return nodes_.empty();
		}

		[[nodiscard]] auto is_connected(N const& src, N const& dst) const -> bool {
			if (!is_node(src) || !is_node(dst)) {
				throw std::runtime_error("Cannot call gdwg::graph<N, E>::is_connected if src or dst node don't exist "
				                         "in the "
				                         "graph");
			}
			auto it = connect_.find(src);
			if (it != connect_.end()) {
				for (const auto& edge_ptr : it->second) {
					if (edge_ptr->get_nodes().second == dst) {
						return true;
					}
				}
			}
			return false;
		}

		[[nodiscard]] auto nodes() const -> std::vector<N> {
			auto result = std::vector<N>(nodes_.begin(), nodes_.end());
			sort(result.begin(), result.end());
			return result;
		}

		[[nodiscard]] auto edges(N const& src, N const& dst) const -> std::vector<std::unique_ptr<edge>> {
			if (!is_node(src) || !is_node(dst)) {
				throw std::runtime_error("Cannot call gdwg::graph<N, E>::edges if src or dst node don't exist in the "
				                         "graph");
			}
			auto src_edges = connect_.find(src);
			std::vector<std::unique_ptr<edge>> result;
			if (src_edges != connect_.end()) {
				for (const auto& e : src_edges->second) {
					if (e->get_nodes().second == dst) {
						std::unique_ptr<edge> uni_e;
						if (e->is_weighted()) {
							uni_e = std::make_unique<weighted_edge<N, E>>(e->get_nodes().first,
							                                              e->get_nodes().second,
							                                              *(e->get_weight()));
						}
						else {
							uni_e = std::make_unique<unweighted_edge<N, E>>(e->get_nodes().first, e->get_nodes().second);
						}
						result.push_back(std::move(uni_e));
					}
				}
				sort(result.begin(), result.end(), [](const auto& a, const auto& b) {
					// if a is unweighted
					if (!a->is_weighted() && b->is_weighted())
						return true;
					// if b is unweighted
					if (a->is_weighted() && !b->is_weighted())
						return false;
					// if both weighted, then compared
					if (a->is_weighted() && b->is_weighted()) {
						return a->get_weight() < b->get_weight();
					}
					return false;
				});
			}
			return result;
		}

		[[nodiscard]] auto find(N const& src, N const& dst, std::optional<E> weight = std::nullopt) -> iterator {
			auto src_edges = connect_.find(src);
			// check exist edge
			if (src_edges != connect_.end()) {
				auto e = src_edges->second.begin();
				while (e != src_edges->second.end()) {
					if ((*e)->get_nodes().second == dst) {
						// whether weighted or unweighted
						auto node_it = nodes_.find(src);
						if (weight == std::nullopt && !(*e)->is_weighted()) {
							return gdwg::graph<N, E>::iterator(const_cast<graph<N, E>*>(this), node_it, e);
						}
						if (weight != std::nullopt && (*e)->is_weighted() && (*e)->get_weight() == weight) {
							return gdwg::graph<N, E>::iterator(const_cast<graph<N, E>*>(this), node_it, e);
						}
					}
					e++;
				}
			}
			return end();
		}

		[[nodiscard]] auto connections(N const& src) const -> std::vector<N> {
			if (!is_node(src)) {
				throw std::runtime_error("Cannot call gdwg::graph<N, E>::connections if src doesn't exist in the "
				                         "graph");
			}
			std::vector<N> connected_nodes;
			for (auto& e : edges_) {
				if (e->get_nodes().first == src) {
					connected_nodes.push_back(e->get_nodes().second);
				}
				if (e->get_nodes().second == src) {
					connected_nodes.push_back(e->get_nodes().first);
				}
			}
			sort(connected_nodes.begin(), connected_nodes.end());
			connected_nodes.erase(unique(connected_nodes.begin(), connected_nodes.end()), connected_nodes.end());
			return connected_nodes;
		}

		/////////////////////////
		//// Iterator Access ////
		/////////////////////////

		[[nodiscard]] auto begin() const -> iterator {
			// find first node
			auto node_it = nodes_.begin();
			if (node_it == nodes_.end()) {
				return end();
			}
			while (node_it != nodes_.end() && connect_.count(*node_it) == 0) {
				++node_it;
			}
			auto edge_it = connect_.find(*node_it);
			if (edge_it == connect_.end()) {
				return end();
			}
			return iterator(const_cast<graph<N, E>*>(this), node_it, edge_it->second.begin());
		}

		[[nodiscard]] auto end() const -> iterator {
			return iterator(const_cast<graph<N, E>*>(this), nodes_.end(), edges_.end());
		}

		////////////////////
		//// Comparison ////
		////////////////////

		[[nodiscard]] auto operator==(graph const& other) const -> bool {
			// compare node
			if (nodes_.size() != other.nodes_.size() || !std::equal(nodes_.begin(), nodes_.end(), other.nodes_.begin()))
			{
				return false;
			}
			// check edge size same
			if (edges_.size() != other.edges_.size()) {
				return false;
			}
			// check all element are same
			return std::equal(edges_.begin(), edges_.end(), other.edges_.begin(), [](const auto& a, const auto& b) {
				if (!a || !b)
					return false;
				return a->get_nodes() == b->get_nodes() && a->get_weight() == b->get_weight();
			});
		}

		///////////////////
		//// Extractor ////
		///////////////////

		template<typename N_, typename E_>
		friend auto operator<<(std::ostream& os, graph<N_, E_> const& g) -> std::ostream& {
			for (const auto& node : g.nodes_) {
				os << node;
				// check node have edges
				const auto& node_edges = g.connect_.find(node);
				if (node_edges == g.connect_.end()) {
					os << " (\n)\n";
					continue;
				}
				os << " (";
				// find unweighted edge
				for (const auto& e : node_edges->second) {
					if (!e->is_weighted() && e->get_nodes().first == node) {
						os << "\n  " << e->print_edge();
					}
				}
				// output all edges
				for (const auto& e : node_edges->second) {
					if (e->is_weighted()) {
						os << "\n  " << e->print_edge();
					}
				}
				os << "\n)\n";
			}
			return os;
		}

	 private:
		std::set<N> nodes_;
		std::vector<std::shared_ptr<edge>> edges_;
		std::map<N, std::vector<std::shared_ptr<edge>>> connect_;
		static auto compareEdge(std::shared_ptr<edge>& a, std::shared_ptr<edge>& b) -> bool {
			if (a->get_nodes().first == b->get_nodes().first) {
				if (a->get_nodes().second == b->get_nodes().second) {
					// if a is unweighted
					if (!a->is_weighted() && b->is_weighted())
						return true;
					// if b is unweighted
					if (a->is_weighted() && !b->is_weighted())
						return false;
					// if both weighted, then compared
					if (a->is_weighted() && b->is_weighted()) {
						return a->get_weight() < b->get_weight();
					}
					return false;
				}
				return a->get_nodes().second < b->get_nodes().second;
			}
			return a->get_nodes().first < b->get_nodes().first;
		}
	};

	///////////////////////////////////////////
	//********    Iterator  Class    ********//
	///////////////////////////////////////////

	template<typename N, typename E>
	class graph<N, E>::iterator {
	 public:
		using value_type = struct {
			N from;
			N to;
			std::optional<E> weight;
		};
		using reference = value_type;
		using pointer = void;
		using difference_type = std::ptrdiff_t;
		using iterator_category = std::bidirectional_iterator_tag;

		// Iterator constructor
		iterator() = default;

		// Iterator source
		auto operator*() -> reference {
			return value_type{(*edge_it)->get_nodes().first, (*edge_it)->get_nodes().second, (*edge_it)->get_weight()};
		}

		// Iterator traversal
		auto operator++() -> iterator& {
			edge_it++;
			// get edges
			const auto& e_it = graph_->connect_.find(*node_it);
			if (edge_it == e_it->second.end()) {
				// get next element throw iterate list
				while (true) {
					node_it++;
					if (node_it == graph_->nodes_.end()) {
						*this = graph_->end();
						break;
					}
					const auto& e_i = graph_->connect_.find(*node_it);
					if (e_i != graph_->connect_.end()) {
						edge_it = e_i->second.begin();
						break;
					}
				}
			}
			return *this;
		}

		auto operator++(int) -> iterator {
			auto temp = *this;
			++*this;
			return temp;
		}

		auto operator--() -> iterator& {
			if (edge_it == graph_->edges_.begin()) {
				*this = graph_->begin();
			}
			else {
				edge_it--;
				node_it = graph_->nodes_.find((*edge_it)->get_nodes().first);
			}
			return *this;
		}

		auto operator--(int) -> iterator {
			auto temp = *this;
			--*this;
			return temp;
		}

		// Iterator comparison
		auto operator==(iterator const& other) const -> bool {
			return graph_ == other.graph_ && node_it == other.node_it && edge_it == other.edge_it;
		}

	 private:
		explicit iterator(const graph<N, E>* graph_i,
		                  typename std::set<N>::const_iterator node_i,
		                  typename std::vector<std::shared_ptr<gdwg::edge<N, E>>>::const_iterator edge_i)
		: graph_(graph_i)
		, node_it(node_i)
		, edge_it(edge_i) {}
		friend class graph<N, E>;
		const graph<N, E>* graph_;
		typename std::set<N>::const_iterator node_it;
		typename std::vector<std::shared_ptr<gdwg::edge<N, E>>>::const_iterator edge_it;
	};
} // namespace gdwg

#endif // GDWG_GRAPH_H
